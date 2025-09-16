import { supabase } from './supabase'
import { Product, Categoria, Marca, Linea, PlanFinanciacion, ProductoPlan } from './products'

// Cache global para categorías y marcas
let categoriesCache: Map<number, Categoria> | null = null
let brandsCache: Map<number, Marca> | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Función para obtener categorías y marcas con cache
async function getCachedCategoriesAndBrands(): Promise<{ categoriesCache: Map<number, Categoria>, brandsCache: Map<number, Marca> }> {
  const now = Date.now()
  
  if (!categoriesCache || !brandsCache || (now - cacheTimestamp) > CACHE_DURATION) {
    const [categoriesResponse, brandsResponse] = await Promise.all([
      supabase.from('categorias').select('*'),
      supabase.from('marcas').select('*')
    ])
    
    categoriesCache = new Map(categoriesResponse.data?.map(cat => [cat.id, cat]) || [])
    brandsCache = new Map(brandsResponse.data?.map(brand => [brand.id, brand]) || [])
    cacheTimestamp = now
  }
  
  return { categoriesCache: categoriesCache!, brandsCache: brandsCache! }
}

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
        .eq('fk_id_producto', parseInt(productoId) || 0)
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
        .eq('fk_id_producto', parseInt(productoId) || 0)
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

    // Obtener categorías y marcas usando cache
    const { categoriesCache: categoriesMap, brandsCache: brandsMap } = await getCachedCategoriesAndBrands()

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
      .from('categorias')
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
      .from('categorias')
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
      .from('categorias')
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
      .from('categorias')
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
      .from('categorias')
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
        .eq('fk_id_producto', parseInt(productoId) || 0)
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
        .eq('fk_id_producto', parseInt(productoId) || 0)
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

// Obtener todas las líneas
export async function getLineas(): Promise<Linea[]> {
  try {
    const { data, error } = await supabase
      .from('lineas')
      .select('*')
      .order('descripcion', { ascending: true })

    if (error) {
      console.error('Error fetching lineas:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching lineas:', error)
    return []
  }
}

// Obtener líneas con sus categorías agrupadas
export async function getLineasWithCategorias(): Promise<(Linea & { categorias: Categoria[] })[]> {
  try {
    // 1. Obtener todas las líneas
    const { data: lineas, error: lineasError } = await supabase
      .from('lineas')
      .select('*')
      .order('descripcion', { ascending: true })

    if (lineasError) {
      console.error('Error fetching lineas:', lineasError)
      return []
    }

    // 2. Obtener todas las categorías con su línea
    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select('*')
      .order('descripcion', { ascending: true })

    if (categoriasError) {
      console.error('Error fetching categorias:', categoriasError)
      return []
    }

    // 3. Agrupar categorías por línea y filtrar solo las que tienen categorías
    const result = lineas?.map(linea => ({
      ...linea,
      categorias: categorias?.filter(categoria => categoria.fk_id_linea === linea.id) || []
    }))
    .filter(linea => linea.categorias.length > 0) || []

    return result
  } catch (error) {
    console.error('Error fetching lineas with categorias:', error)
    return []
  }
}

// Obtener categorías sin línea asignada
export async function getCategoriasWithoutLinea(): Promise<Categoria[]> {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .is('fk_id_linea', null)
      .order('descripcion', { ascending: true })

    if (error) {
      console.error('Error fetching categorias without linea:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching categorias without linea:', error)
    return []
  }
}

// Obtener productos que tienen plan de 12 cuotas
export async function getProductosConPlan12Cuotas(): Promise<Product[]> {
  try {
    // Buscar productos que tengan asociado un plan de 12 cuotas (ID = 3) en planes default
    const { data: productosConPlan, error: planesError } = await supabase
      .from('producto_planes_default')
      .select('fk_id_producto')
      .eq('fk_id_plan', 3)

    if (planesError) {
      console.error('Error fetching productos con plan 12:', planesError)
      return []
    }

    const productIds = [...new Set(productosConPlan?.map(item => item.fk_id_producto) || [])]

    if (productIds.length === 0) {
      return []
    }

    // Obtener los productos completos
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .in('id', productIds)
      .gt('precio', 0)
      .eq('activo', true)
      .order('descripcion', { ascending: true })

    if (error) {
      console.error('Error fetching productos con plan 12:', error)
      return []
    }

    // Obtener categorías y marcas
    const { categoriesCache, brandsCache } = await getCachedCategoriesAndBrands()

    // Transformar datos
    const transformedData = data?.map(product => {
      const categoria = categoriesCache.get(product.fk_id_categoria) || 
                       { id: product.fk_id_categoria || 1, descripcion: `Categoría ${product.fk_id_categoria || 1}` }
      
      const marca = brandsCache.get(product.fk_id_marca) || 
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
    console.error('Error fetching productos con plan 12 cuotas:', error)
    return []
  }
}

// Obtener productos dinámicos basados en la configuración web del home
export async function getProductosHomeDinamicos(): Promise<Product[]> {
  try {
    // Primero obtener todos los productos que tienen planes en producto_planes_default (sin filtros)
    const { data: productosConPlanesDefault, error: planesDefaultError } = await supabase
      .from('producto_planes_default')
      .select('fk_id_producto')
      .not('fk_id_producto', 'is', null)
      .eq('activo', true)

    if (planesDefaultError) {
      console.error('Error obteniendo productos con planes default:', planesDefaultError)
      return []
    }

    // Obtener IDs únicos de productos que tienen planes
    const productIdsConPlanes = [...new Set(productosConPlanesDefault?.map(item => item.fk_id_producto) || [])]

    console.log('🔍 getProductosHomeDinamicos - Productos con planes en tabla default:', productIdsConPlanes.length)

    if (productIdsConPlanes.length === 0) {
      console.log('🔍 getProductosHomeDinamicos - No hay productos con planes en producto_planes_default')
      return []
    }

    // Obtener la configuración para aplicar filtros adicionales
    const { data: config, error: configError } = await supabase
      .from('configuracion_web')
      .select('home_display_plan_id, home_display_products_count, home_display_category_filter, home_display_brand_filter, home_display_featured_only')
      .limit(1)
      .single()

    if (configError || !config) {
      console.log('⚠️ getProductosHomeDinamicos - Error o sin configuración web, usando todos los productos con planes:', configError)
    }

    const {
      home_display_plan_id,
      home_display_products_count = 12, // Valor por defecto si no hay configuración
      home_display_category_filter,
      home_display_brand_filter,
      home_display_featured_only
    } = config || {}

    console.log('🔍 getProductosHomeDinamicos - Configuración:', {
      home_display_plan_id,
      home_display_products_count,
      home_display_category_filter,
      home_display_brand_filter,
      home_display_featured_only
    })

    // Si hay un plan específico configurado, filtrar solo los productos con ese plan
    let productIdsFiltrados = productIdsConPlanes

    if (home_display_plan_id && home_display_plan_id !== null) {
      console.log('🔍 getProductosHomeDinamicos - Filtrando por plan específico:', home_display_plan_id)

      const { data: productosConPlanEspecifico, error: planEspecificoError } = await supabase
        .from('producto_planes_default')
        .select('fk_id_producto')
        .eq('fk_id_plan', home_display_plan_id)
        .not('fk_id_producto', 'is', null)
        .eq('activo', true)

      if (planEspecificoError) {
        console.error('Error filtrando por plan específico:', planEspecificoError)
      } else {
        productIdsFiltrados = [...new Set(productosConPlanEspecifico?.map(item => item.fk_id_producto) || [])]
        console.log('🔍 getProductosHomeDinamicos - Productos filtrados por plan', home_display_plan_id, ':', productIdsFiltrados.length)
      }
    }

    // Construir query dinámico con filtros
    let query = supabase
      .from('productos')
      .select('*')
      .in('id', productIdsFiltrados)
      .gt('precio', 0)
      .eq('activo', true)

    // Aplicar filtro por categoría si está configurado
    if (home_display_category_filter && home_display_category_filter !== null) {
      console.log('🔍 getProductosHomeDinamicos - Aplicando filtro de categoría:', home_display_category_filter)
      query = query.eq('fk_id_categoria', home_display_category_filter)
    } else {
      console.log('🔍 getProductosHomeDinamicos - Sin filtro de categoría, mostrando todas las categorías')
    }

    // Aplicar filtro por marca si está configurado
    if (home_display_brand_filter && home_display_brand_filter !== null) {
      console.log('🔍 getProductosHomeDinamicos - Aplicando filtro de marca:', home_display_brand_filter)
      query = query.eq('fk_id_marca', home_display_brand_filter)
    } else {
      console.log('🔍 getProductosHomeDinamicos - Sin filtro de marca, mostrando todas las marcas')
    }

    // Aplicar filtro de destacados si está configurado
    if (home_display_featured_only) {
      console.log('🔍 getProductosHomeDinamicos - Aplicando filtro de destacados')
      query = query.eq('destacado', true)
    } else {
      console.log('🔍 getProductosHomeDinamicos - Sin filtro de destacados, mostrando todos los productos')
    }

    // Aplicar límite de productos y ordenamiento
    query = query
      .order('destacado', { ascending: false })
      .order('descripcion', { ascending: true })
      .limit(home_display_products_count)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching productos dinámicos:', error)
      return []
    }

    console.log('🔍 getProductosHomeDinamicos - Productos encontrados:', data?.length || 0)

    // Obtener categorías y marcas
    const { categoriesCache, brandsCache } = await getCachedCategoriesAndBrands()

    // Transformar datos
    const transformedData = data?.map(product => {
      const categoria = categoriesCache.get(product.fk_id_categoria) || 
                       { id: product.fk_id_categoria || 1, descripcion: `Categoría ${product.fk_id_categoria || 1}` }
      
      const marca = brandsCache.get(product.fk_id_marca) || 
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
    console.error('Error fetching productos dinámicos home:', error)
    return []
  }
}

// ========================================
// FUNCIONES PARA COMBOS
// ========================================

// Obtener planes disponibles para un combo específico
export async function getPlanesCombo(comboId: string): Promise<PlanFinanciacion[]> {
  try {
    console.log('🔍 getPlanesCombo: Buscando planes para combo ID:', comboId)

    // Buscar planes en producto_planes_default usando fk_id_combo
    const { data: planesCombo, error: errorPlanes } = await supabase
      .from('producto_planes_default')
      .select('fk_id_plan')
      .eq('fk_id_combo', parseInt(comboId) || 0)
      .not('fk_id_plan', 'is', null)
      .eq('activo', true)

    console.log('🔍 getPlanesCombo: Planes encontrados:', planesCombo?.length || 0)
    console.log('🔍 getPlanesCombo: Error en consulta planes:', errorPlanes)

    if (planesCombo && planesCombo.length > 0) {
      // Obtener los planes de financiación por separado
      const planIds = planesCombo.map(p => p.fk_id_plan)
      console.log('🔍 getPlanesCombo: IDs de planes encontrados:', planIds)

      const { data: planesData, error: planesError } = await supabase
        .from('planes_financiacion')
        .select('*')
        .in('id', planIds)
        .eq('activo', true)
        .order('cuotas', { ascending: true })

      if (planesData && planesData.length > 0) {
        console.log('🔍 getPlanesCombo: Detalle planes:', planesData.map(p => p.cuotas))
        console.log('✅ getPlanesCombo: Usando planes del combo:', planesData.length)
        return planesData
      }
    }

    console.log('🔍 getPlanesCombo: No hay planes específicos para este combo')
    return []
  } catch (error) {
    console.error('❌ getPlanesCombo: Error general:', error)
    return []
  }
}

// Calcular cuotas para un combo específico
export async function calcularCuotasCombo(comboId: string, planId: number) {
  try {
    const combo = await getComboById(comboId)
    const { data: planData, error } = await supabase
      .from('planes_financiacion')
      .select('*')
      .eq('id', planId)
      .eq('activo', true)
      .single()

    if (error || !combo || !planData) {
      console.error('Error calculating combo installments:', error)
      return null
    }

    return calcularCuota(combo.precio, planData)
  } catch (error) {
    console.error('Error calculating combo installments:', error)
    return null
  }
}

// Obtener todos los combos activos
export async function getCombos(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('combos')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching combos:', error)
      return []
    }

    return data?.map(combo => ({
      ...combo,
      imagenes: [
        combo.imagen,
        combo.imagen_2,
        combo.imagen_3,
        combo.imagen_4,
        combo.imagen_5
      ].filter(img => img && img.trim() !== '')
    })) || []
  } catch (error) {
    console.error('Error fetching combos:', error)
    return []
  }
}

// Obtener combo por ID con sus productos
export async function getComboById(id: string): Promise<any | null> {
  try {
    const { data: combo, error: comboError } = await supabase
      .from('combos')
      .select('*')
      .eq('id', parseInt(id) || 0)
      .eq('activo', true)
      .single()

    if (comboError || !combo) {
      console.error('Error fetching combo:', comboError)
      return null
    }

    // Obtener productos del combo
    const { data: comboProductos, error: productosError } = await supabase
      .from('combo_productos')
      .select(`
        *,
        productos:fk_id_producto (*)
      `)
      .eq('fk_id_combo', parseInt(id) || 0)

    if (productosError) {
      console.error('Error fetching combo productos:', productosError)
    }

    // Procesar productos con categorías y marcas
    const { categoriesCache, brandsCache } = await getCachedCategoriesAndBrands()

    const productosConRelaciones = comboProductos?.map(cp => {
      const producto = cp.productos
      if (!producto) return cp

      const categoria = categoriesCache.get(producto.fk_id_categoria) ||
                       { id: producto.fk_id_categoria || 1, descripcion: `Categoría ${producto.fk_id_categoria || 1}` }

      const marca = brandsCache.get(producto.fk_id_marca) ||
                   { id: producto.fk_id_marca || 1, descripcion: `Marca ${producto.fk_id_marca || 1}` }

      return {
        ...cp,
        producto: {
          ...producto,
          categoria,
          marca
        }
      }
    }) || []

    return {
      ...combo,
      productos: productosConRelaciones,
      imagenes: [
        combo.imagen,
        combo.imagen_2,
        combo.imagen_3,
        combo.imagen_4,
        combo.imagen_5
      ].filter(img => img && img.trim() !== '')
    }
  } catch (error) {
    console.error('Error fetching combo by id:', error)
    return null
  }
}

// Verificar si un combo está vigente
export function isComboValid(combo: any): boolean {
  const now = new Date()
  const inicio = combo.fecha_vigencia_inicio ? new Date(combo.fecha_vigencia_inicio) : null
  const fin = combo.fecha_vigencia_fin ? new Date(combo.fecha_vigencia_fin) : null

  if (inicio && now < inicio) return false
  if (fin && now > fin) return false

  return true
}

// Obtener combos vigentes para la home
export async function getCombosVigentes(): Promise<any[]> {
  try {
    const combos = await getCombos()
    return combos.filter(combo => isComboValid(combo))
  } catch (error) {
    console.error('Error fetching combos vigentes:', error)
    return []
  }
}

// Obtener combos por categoría
export async function getCombosByCategory(categoryId: number): Promise<any[]> {
  try {
    console.log('🔍 getCombosByCategory - Buscando combos para categoría:', categoryId)

    const { data, error } = await supabase
      .from('combos')
      .select('*')
      .eq('fk_id_categoria', categoryId)
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching combos by category:', error)
      return []
    }

    console.log('🔍 getCombosByCategory - Combos encontrados:', data?.length || 0)

    const combosWithImages = data?.map(combo => ({
      ...combo,
      imagenes: [
        combo.imagen,
        combo.imagen_2,
        combo.imagen_3,
        combo.imagen_4,
        combo.imagen_5
      ].filter(img => img && img.trim() !== '')
    })) || []

    // Filtrar solo combos vigentes
    return combosWithImages.filter(combo => isComboValid(combo))
  } catch (error) {
    console.error('Error fetching combos by category:', error)
    return []
  }
}

// Buscar combos por término de búsqueda
export async function searchCombos(searchTerm: string): Promise<any[]> {
  try {
    if (!searchTerm.trim()) return []

    console.log('🔍 searchCombos - Buscando combos con término:', searchTerm)

    const { data, error } = await supabase
      .from('combos')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching combos:', error)
      return []
    }

    console.log('🔍 searchCombos - Combos totales obtenidos:', data?.length || 0)

    const combosWithImages = data?.map(combo => ({
      ...combo,
      imagenes: [
        combo.imagen,
        combo.imagen_2,
        combo.imagen_3,
        combo.imagen_4,
        combo.imagen_5
      ].filter(img => img && img.trim() !== '')
    })) || []

    // Filtrar solo combos vigentes
    const combosVigentes = combosWithImages.filter(combo => isComboValid(combo))

    // Filtrar por término de búsqueda
    const searchLower = searchTerm.toLowerCase()
    const filteredCombos = combosVigentes.filter(combo => {
      const nombre = combo.nombre?.toLowerCase() || ''
      const descripcion = combo.descripcion?.toLowerCase() || ''

      return nombre.includes(searchLower) ||
             descripcion.includes(searchLower)
    })

    console.log('🔍 searchCombos - Combos filtrados:', filteredCombos.length)

    return filteredCombos
  } catch (error) {
    console.error('Error searching combos:', error)
    return []
  }
}

// Obtener información del plan configurado para el home
export async function getPlanHomeDinamico(): Promise<PlanFinanciacion | null> {
  try {
    const { data: config, error: configError } = await supabase
      .from('configuracion_web')
      .select('home_display_plan_id')
      .limit(1)
      .single()

    if (configError || !config || !config.home_display_plan_id) {
      // Fallback al plan de 12 cuotas
      const { data: planData, error } = await supabase
        .from('planes_financiacion')
        .select('*')
        .eq('id', 3)
        .eq('activo', true)
        .single()

      if (error) {
        console.error('Error fetching plan fallback:', error)
        return null
      }

      return planData
    }

    const { data: planData, error: planError } = await supabase
      .from('planes_financiacion')
      .select('*')
      .eq('id', config.home_display_plan_id)
      .eq('activo', true)
      .single()

    if (planError) {
      console.error('Error fetching plan configurado:', planError)
      return null
    }

    return planData
  } catch (error) {
    console.error('Error fetching plan dinámico home:', error)
    return null
  }
}