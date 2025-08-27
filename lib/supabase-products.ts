import { supabase } from './supabase'
import { Product, Categoria, Marca, PlanFinanciacion, ProductoPlan } from './products'

// Función para formatear números sin decimales
export function formatearPrecio(precio: number): string {
  return precio.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

// Función para redondear cuotas: a partir de $50 redondea por centenas
export function redondearCuota(cuota: number): number {
  if (cuota >= 50) {
    // Redondear por centenas (a la centena más cercana)
    return Math.round(cuota / 100) * 100
  }
  // Para cuotas menores a $50, mantener redondeo a 2 decimales
  return Math.round(cuota * 100) / 100
}

// Función para calcular precio P.ELECTRO (precio + 10%)
export function calcularPrecioElectro(precio: number): number {
  return precio * 1.1
}

// Función para calcular cuotas
export function calcularCuota(precio: number, plan: PlanFinanciacion) {
  // Verificar si el producto aplica para este plan
  if (precio < plan.monto_minimo) return null
  if (plan.monto_maximo && precio > plan.monto_maximo) return null
  
  // Calcular precio con recargo
  const recargo = (precio * plan.recargo_porcentual / 100) + plan.recargo_fijo
  const precio_final = precio + recargo
  
  // Calcular cuota mensual con redondeo especial
  const cuota_mensual_raw = precio_final / plan.cuotas
  const cuota_mensual = redondearCuota(cuota_mensual_raw)
  
  // Calcular precio P.ELECTRO
  const precio_electro = calcularPrecioElectro(precio)
  const recargo_electro = (precio_electro * plan.recargo_porcentual / 100) + plan.recargo_fijo
  const precio_final_electro = precio_electro + recargo_electro
  const cuota_mensual_electro = redondearCuota(precio_final_electro / plan.cuotas)
  
  return {
    precio_original: precio,
    recargo_total: recargo,
    precio_final: precio_final,
    cuota_mensual: cuota_mensual,
    cuotas: plan.cuotas,
    recargo_porcentual: plan.recargo_porcentual,
    // Nuevos campos para P.ELECTRO
    precio_electro: precio_electro,
    precio_final_electro: precio_final_electro,
    cuota_mensual_electro: cuota_mensual_electro
  }
}

// Función para calcular el anticipo
export function calcularAnticipo(precio: number, plan: PlanFinanciacion) {
  let anticipo = 0
  
  // Si hay anticipo fijo, usarlo
  if (plan.anticipo_minimo_fijo && plan.anticipo_minimo_fijo > 0) {
    anticipo = plan.anticipo_minimo_fijo
  }
  // Si hay anticipo por porcentaje, calcularlo
  else if (plan.anticipo_minimo && plan.anticipo_minimo > 0) {
    anticipo = (precio * plan.anticipo_minimo) / 100
  }
  
  // Aplicar redondeo de $50 para arriba
  if (anticipo >= 50) {
    return Math.ceil(anticipo / 50) * 50
  }
  
  return Math.round(anticipo * 100) / 100 // Para anticipos menores a $50, mantener redondeo a 2 decimales
}

// Obtener todos los planes de financiación activos
export async function getPlanesFinanciacion(): Promise<PlanFinanciacion[]> {
  try {
    const { data, error } = await supabase
      .from('planes_financiacion')
      .select('*')
      .eq('activo', true)
      .order('cuotas', { ascending: true })

    if (error) {
      console.error('Error fetching financing plans:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching financing plans:', error)
    return []
  }
}

// Obtener planes disponibles para un producto específico con lógica simplificada
export async function getPlanesProducto(productoId: string): Promise<PlanFinanciacion[]> {
  try {
    //console.log('🔍 getPlanesProducto: Buscando planes para producto ID:', productoId)
    
    // 1. PRIORIDAD ALTA: Buscar planes especiales (productos_planes)
    try {
      const { data: planesEspeciales, error: errorEspeciales } = await supabase
        .from('producto_planes')
        .select('fk_id_plan')
        .eq('fk_id_producto', parseInt(productoId))
        .eq('activo', true)

      //console.log('🔍 getPlanesProducto: Planes especiales encontrados:', planesEspeciales?.length || 0)
      //console.log('🔍 getPlanesProducto: Error en consulta planes especiales:', errorEspeciales)
      
      if (planesEspeciales && planesEspeciales.length > 0) {
        // Obtener los planes de financiación por separado
        const planIds = planesEspeciales.map(p => p.fk_id_plan)
        //console.log('🔍 getPlanesProducto: IDs de planes especiales encontrados:', planIds)
        
        const { data: planesData, error: planesError } = await supabase
          .from('planes_financiacion')
          .select('*')
          .in('id', planIds)
          .eq('activo', true)
        
        if (planesData && planesData.length > 0) {
          //console.log('🔍 getPlanesProducto: Detalle planes especiales:', planesData.map(p => p.cuotas))
          //console.log('✅ getPlanesProducto: Usando planes especiales:', planesData.length, planesData.map(p => p.cuotas))
          return planesData
        }
      }
    } catch (error) {
      console.log('⚠️ getPlanesProducto: Error al buscar planes especiales (tabla puede no existir):', error)
    }

    // 2. PRIORIDAD BAJA: Si no hay planes especiales, usar planes por defecto
    //console.log('🔍 getPlanesProducto: No hay planes especiales, buscando planes por defecto...')
    
    try {
      const { data: planesDefault, error: errorDefault } = await supabase
        .from('producto_planes_default')
        .select('fk_id_plan')
        .eq('fk_id_producto', parseInt(productoId))
        .eq('activo', true)

      //console.log('🔍 getPlanesProducto: Planes por defecto encontrados:', planesDefault?.length || 0)
      //console.log('🔍 getPlanesProducto: Error en consulta planes por defecto:', errorDefault)
      
      if (planesDefault && planesDefault.length > 0) {
        // Obtener los planes de financiación por separado
        const planIds = planesDefault.map(p => p.fk_id_plan)
        //console.log('🔍 getPlanesProducto: IDs de planes encontrados:', planIds)
        
        const { data: planesData, error: planesError } = await supabase
          .from('planes_financiacion')
          .select('*')
          .in('id', planIds)
          .eq('activo', true)
        
        if (planesData && planesData.length > 0) {
          //console.log('🔍 getPlanesProducto: Detalle planes por defecto:', planesData.map(p => p.cuotas))
          //console.log('✅ getPlanesProducto: Usando planes por defecto:', planesData.length, planesData.map(p => p.cuotas))
          return planesData
        }
      }
    } catch (error) {
      console.log('⚠️ getPlanesProducto: Error al buscar planes por defecto (tabla puede no existir):', error)
    }

    // 3. FALLBACK: Si no hay planes especiales ni por defecto, no mostrar ningún plan
    //console.log('🔍 getPlanesProducto: No hay planes específicos ni por defecto para este producto')
    //console.log('✅ getPlanesProducto: No se mostrarán planes de financiación')
    return []
  } catch (error) {
    console.error('❌ getPlanesProducto: Error general:', error)
    return []
  }
}

// Calcular cuotas para un producto específico
export async function calcularCuotasProducto(productoId: string, planId: number) {
  try {
    const producto = await getProductById(productoId)
    const { data: planData, error } = await supabase
      .from('planes_financiacion')
      .select('*')
      .eq('id', planId)
      .eq('activo', true)
      .single()

    if (error || !producto || !planData) {
      console.error('Error calculating product installments:', error)
      return null
    }

    return calcularCuota(producto.precio, planData)
  } catch (error) {
    console.error('Error calculating product installments:', error)
    return null
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    // Obtener todos los productos sin JOIN para asegurar que no se pierdan productos
    // Excluir productos con precio 0
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .gt('precio', 0)
      .eq('activo', true)
      .order('destacado', { ascending: false })
      .order('descripcion', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    //console.log('🔍 getProducts - Total productos obtenidos:', data?.length || 0)

    // Obtener categorías y marcas por separado para hacer el mapeo manualmente
    const { data: categories, error: categoriesError } = await supabase
      .from('categoria')
      .select('*')

    const { data: brands, error: brandsError } = await supabase
      .from('marcas')
      .select('*')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    }

    if (brandsError) {
      console.error('Error fetching brands:', brandsError)
    }

    // Crear mapas para búsqueda rápida
    const categoriesMap = new Map(categories?.map(cat => [cat.id, cat]) || [])
    const brandsMap = new Map(brands?.map(brand => [brand.id, brand]) || [])

    // Transformar datos para que coincidan con la nueva estructura
    const transformedData = data?.map(product => {
      const categoria = categoriesMap.get(product.fk_id_categoria) || 
                       { id: product.fk_id_categoria || 1, descripcion: `Categoría ${product.fk_id_categoria || 1}` }
      
      const marca = brandsMap.get(product.fk_id_marca) || 
                   { id: product.fk_id_marca || 1, descripcion: `Marca ${product.fk_id_marca || 1}` }

      return {
        ...product,
        fk_id_categoria: product.fk_id_categoria || 1,
        fk_id_marca: product.fk_id_marca || 1,
        categoria,
        marca
      }
    }) || []

    //console.log('🔍 getProducts - Productos transformados:', transformedData.length)

    return transformedData
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('destacado', true)
      .gt('precio', 0)
      .eq('activo', true)
      .order('descripcion', { ascending: true })

    if (error) {
      console.error('Error fetching featured products:', error)
      return []
    }

    // Obtener categorías y marcas por separado
    const { data: categories, error: categoriesError } = await supabase
      .from('categoria')
      .select('*')

    const { data: brands, error: brandsError } = await supabase
      .from('marcas')
      .select('*')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    }

    if (brandsError) {
      console.error('Error fetching brands:', brandsError)
    }

    // Crear mapas para búsqueda rápida
    const categoriesMap = new Map(categories?.map(cat => [cat.id, cat]) || [])
    const brandsMap = new Map(brands?.map(brand => [brand.id, brand]) || [])

    // Transformar datos para que coincidan con la nueva estructura
    const transformedData = data?.map(product => {
      const categoria = categoriesMap.get(product.fk_id_categoria) || 
                       { id: product.fk_id_categoria || 1, descripcion: `Categoría ${product.fk_id_categoria || 1}` }
      
      const marca = brandsMap.get(product.fk_id_marca) || 
                   { id: product.fk_id_marca || 1, descripcion: `Marca ${product.fk_id_marca || 1}` }

      return {
        ...product,
        fk_id_categoria: product.fk_id_categoria || 1,
        fk_id_marca: product.fk_id_marca || 1,
        categoria,
        marca
      }
    }) || []

    return transformedData
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('fk_id_categoria', categoryId)
      .gt('precio', 0)
      .eq('activo', true)
      .order('destacado', { ascending: false })
      .order('descripcion', { ascending: true })

    if (error) {
      console.error('Error fetching products by category:', error)
      return []
    }

    // Obtener categorías y marcas por separado
    const { data: categories, error: categoriesError } = await supabase
      .from('categoria')
      .select('*')

    const { data: brands, error: brandsError } = await supabase
      .from('marcas')
      .select('*')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    }

    if (brandsError) {
      console.error('Error fetching brands:', brandsError)
    }

    // Crear mapas para búsqueda rápida
    const categoriesMap = new Map(categories?.map(cat => [cat.id, cat]) || [])
    const brandsMap = new Map(brands?.map(brand => [brand.id, brand]) || [])

    // Transformar datos
    const transformedData = data?.map(product => {
      const categoria = categoriesMap.get(product.fk_id_categoria) || 
                       { id: product.fk_id_categoria || 1, descripcion: `Categoría ${product.fk_id_categoria || 1}` }
      
      const marca = brandsMap.get(product.fk_id_marca) || 
                   { id: product.fk_id_marca || 1, descripcion: `Marca ${product.fk_id_marca || 1}` }

      return {
        ...product,
        fk_id_categoria: product.fk_id_categoria || 1,
        fk_id_marca: product.fk_id_marca || 1,
        categoria,
        marca
      }
    }) || []

    return transformedData
  } catch (error) {
    console.error('Error fetching products by category:', error)
    return []
  }
}

export async function getProductsByBrand(brandId: number): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('fk_id_marca', brandId)
      .gt('precio', 0)
      .eq('activo', true)
      .order('destacado', { ascending: false })
      .order('descripcion', { ascending: true })

    if (error) {
      console.error('Error fetching products by brand:', error)
      return []
    }

    // Obtener categorías y marcas por separado
    const { data: categories, error: categoriesError } = await supabase
      .from('categoria')
      .select('*')

    const { data: brands, error: brandsError } = await supabase
      .from('marcas')
      .select('*')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    }

    if (brandsError) {
      console.error('Error fetching brands:', brandsError)
    }

    // Crear mapas para búsqueda rápida
    const categoriesMap = new Map(categories?.map(cat => [cat.id, cat]) || [])
    const brandsMap = new Map(brands?.map(brand => [brand.id, brand]) || [])

    // Transformar datos
    const transformedData = data?.map(product => {
      const categoria = categoriesMap.get(product.fk_id_categoria) || 
                       { id: product.fk_id_categoria || 1, descripcion: `Categoría ${product.fk_id_categoria || 1}` }
      
      const marca = brandsMap.get(product.fk_id_marca) || 
                   { id: product.fk_id_marca || 1, descripcion: `Marca ${product.fk_id_marca || 1}` }

      return {
        ...product,
        fk_id_categoria: product.fk_id_categoria || 1,
        fk_id_marca: product.fk_id_marca || 1,
        categoria,
        marca
      }
    }) || []

    return transformedData
  } catch (error) {
    console.error('Error fetching products by brand:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .eq('activo', true)
      .single()

    if (error) {
      console.error('Error fetching product by id:', error)
      return null
    }

    // Obtener categorías y marcas por separado
    const { data: categories, error: categoriesError } = await supabase
      .from('categoria')
      .select('*')

    const { data: brands, error: brandsError } = await supabase
      .from('marcas')
      .select('*')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    }

    if (brandsError) {
      console.error('Error fetching brands:', brandsError)
    }

    // Crear mapas para búsqueda rápida
    const categoriesMap = new Map(categories?.map(cat => [cat.id, cat]) || [])
    const brandsMap = new Map(brands?.map(brand => [brand.id, brand]) || [])

    // Transformar datos
    const categoria = categoriesMap.get(data.fk_id_categoria) || 
                     { id: data.fk_id_categoria || 1, descripcion: `Categoría ${data.fk_id_categoria || 1}` }
    
    const marca = brandsMap.get(data.fk_id_marca) || 
                 { id: data.fk_id_marca || 1, descripcion: `Marca ${data.fk_id_marca || 1}` }

    // Crear array de imágenes con todos los campos de imagen disponibles
    const imagenes = [
      data.imagen,
      data.imagen_2,
      data.imagen_3,
      data.imagen_4,
      data.imagen_5
    ].filter(img => img && img.trim() !== '') // Filtrar imágenes vacías

    // Debug: Log para verificar las imágenes
    //console.log('🔍 getProductById - Imágenes individuales:', {
      //imagen: data.imagen,
      //imagen_2: data.imagen_2,
      //imagen_3: data.imagen_3,
      //imagen_4: data.imagen_4,
      //imagen_5: data.imagen_5
    //})
    //console.log('🔍 getProductById - Array de imágenes filtrado:', imagenes)

    const transformedData = {
      ...data,
      fk_id_categoria: data.fk_id_categoria || 1,
      fk_id_marca: data.fk_id_marca || 1,
      categoria,
      marca,
      imagenes // Agregar el array de imágenes
    }

    return transformedData
  } catch (error) {
    console.error('Error fetching product by id:', error)
    return null
  }
}

export async function getCategories(): Promise<Categoria[]> {
  try {
    //console.log('🔍 getCategories: Intentando obtener categorías...')
    const { data, error } = await supabase
      .from('categoria')
      .select('*')
      .order('descripcion', { ascending: true })

    //console.log('🔍 getCategories: Respuesta de Supabase:', { data, error })

    if (error) {
      console.error('❌ Error fetching categories:', error)
      return []
    }

    //console.log('✅ getCategories: Datos obtenidos:', data)
    return data || []
  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    return []
  }
}

export async function getBrands(): Promise<Marca[]> {
  try {
    //console.log('🔍 getBrands: Intentando obtener marcas...')
    const { data, error } = await supabase
      .from('marcas')
      .select('*')
      .order('descripcion', { ascending: true })

    //console.log('🔍 getBrands: Respuesta de Supabase:', { data, error })

    if (error) {
      console.error('❌ Error fetching brands:', error)
      return []
    }

    //console.log('✅ getBrands: Datos obtenidos:', data)
    return data || []
  } catch (error) {
    console.error('❌ Error fetching brands:', error)
    return []
  }
} 

// Función para verificar qué tipo de planes tiene un producto
export async function getTipoPlanesProducto(productoId: string): Promise<'especiales' | 'default' | 'todos' | 'ninguno'> {
  try {
    // 1. Verificar planes especiales
    try {
      const { data: planesEspeciales } = await supabase
        .from('producto_planes')
        .select('id')
        .eq('fk_id_producto', parseInt(productoId))
        .eq('activo', true)
        .limit(1)

      if (planesEspeciales && planesEspeciales.length > 0) {
        return 'especiales'
      }
    } catch (error) {
      console.log('⚠️ getTipoPlanesProducto: Error al verificar planes especiales (tabla puede no existir):', error)
    }

    // 2. Verificar planes por defecto
    try {
      const { data: planesDefault } = await supabase
        .from('producto_planes_default')
        .select('id')
        .eq('fk_id_producto', parseInt(productoId))
        .eq('activo', true)
        .limit(1)

      if (planesDefault && planesDefault.length > 0) {
        return 'default'
      }
    } catch (error) {
      //console.log('⚠️ getTipoPlanesProducto: Error al verificar planes por defecto (tabla puede no existir):', error)
    }

    // 3. Si no hay planes especiales ni por defecto, no hay planes para este producto
    return 'ninguno'
  } catch (error) {
    console.error('❌ getTipoPlanesProducto: Error general:', error)
    return 'ninguno'
  }
} 