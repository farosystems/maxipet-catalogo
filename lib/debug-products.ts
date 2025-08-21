// Utilidades para debuggear productos específicos
import { supabase } from './supabase-config'

export async function debugProductByName(productName: string) {
  try {
    console.log('🔍 debugProductByName - Buscando:', productName)
    
    // Buscar por descripción exacta
    const { data: exactMatch, error: exactError } = await supabase
      .from('productos')
      .select('*')
      .eq('descripcion', productName)
      .gt('precio', 0)

    if (exactError) {
      console.error('❌ Error en búsqueda exacta:', exactError)
    } else {
      console.log('🔍 Búsqueda exacta:', exactMatch?.length || 0, 'resultados')
      if (exactMatch && exactMatch.length > 0) {
        console.log('✅ Producto encontrado (exacto):', exactMatch[0])
      }
    }

    // Buscar por descripción que contenga el nombre
    const { data: containsMatch, error: containsError } = await supabase
      .from('productos')
      .select('*')
      .ilike('descripcion', `%${productName}%`)
      .gt('precio', 0)

    if (containsError) {
      console.error('❌ Error en búsqueda por contenido:', containsError)
    } else {
      console.log('🔍 Búsqueda por contenido:', containsMatch?.length || 0, 'resultados')
      if (containsMatch && containsMatch.length > 0) {
        console.log('✅ Productos encontrados (contenido):', containsMatch.slice(0, 3))
      }
    }

    // Buscar sin filtro de precio para ver si existe
    const { data: allMatches, error: allError } = await supabase
      .from('productos')
      .select('*')
      .ilike('descripcion', `%${productName}%`)

    if (allError) {
      console.error('❌ Error en búsqueda sin filtro:', allError)
    } else {
      console.log('🔍 Búsqueda sin filtro de precio:', allMatches?.length || 0, 'resultados')
      if (allMatches && allMatches.length > 0) {
        console.log('✅ Productos encontrados (sin filtro):', allMatches.map(p => ({
          id: p.id,
          descripcion: p.descripcion,
          precio: p.precio,
          categoria: p.categoria,
          marca: p.marca
        })))
      }
    }

    return {
      exact: exactMatch || [],
      contains: containsMatch || [],
      all: allMatches || []
    }
  } catch (error) {
    console.error('❌ Error en debugProductByName:', error)
    return { exact: [], contains: [], all: [] }
  }
}

export async function debugAllProducts() {
  try {
    console.log('🔍 debugAllProducts - Obteniendo todos los productos...')
    
    // Obtener todos los productos sin filtros
    const { data: allProducts, error: allError } = await supabase
      .from('productos')
      .select('*')
      .order('descripcion')

    if (allError) {
      console.error('❌ Error obteniendo todos los productos:', allError)
      return
    }

    console.log('🔍 Total productos en BD:', allProducts?.length || 0)

    // Productos con precio > 0
    const productosConPrecio = allProducts?.filter(p => (p.precio || 0) > 0) || []
    console.log('🔍 Productos con precio > 0:', productosConPrecio.length)

    // Productos con precio = 0
    const productosSinPrecio = allProducts?.filter(p => (p.precio || 0) === 0) || []
    console.log('🔍 Productos con precio = 0:', productosSinPrecio.length)

    // Productos con descripción vacía
    const productosSinDescripcion = allProducts?.filter(p => !p.descripcion || p.descripcion.trim() === '') || []
    console.log('🔍 Productos sin descripción:', productosSinDescripcion.length)

    // Productos sin categoría
    const productosSinCategoria = allProducts?.filter(p => !p.fk_id_categoria) || []
    console.log('🔍 Productos sin categoría:', productosSinCategoria.length)

    // Productos sin marca
    const productosSinMarca = allProducts?.filter(p => !p.fk_id_marca) || []
    console.log('🔍 Productos sin marca:', productosSinMarca.length)

    // Muestra algunos ejemplos
    if (productosConPrecio.length > 0) {
      console.log('🔍 Ejemplos de productos con precio > 0:', productosConPrecio.slice(0, 3).map(p => ({
        id: p.id,
        descripcion: p.descripcion,
        precio: p.precio,
        categoria: p.categoria,
        marca: p.marca
      })))
    }

    if (productosSinPrecio.length > 0) {
      console.log('🔍 Ejemplos de productos con precio = 0:', productosSinPrecio.slice(0, 3).map(p => ({
        id: p.id,
        descripcion: p.descripcion,
        precio: p.precio
      })))
    }

    return {
      total: allProducts?.length || 0,
      conPrecio: productosConPrecio.length,
      sinPrecio: productosSinPrecio.length,
      sinDescripcion: productosSinDescripcion.length,
      sinCategoria: productosSinCategoria.length,
      sinMarca: productosSinMarca.length
    }
  } catch (error) {
    console.error('❌ Error en debugAllProducts:', error)
  }
}

// Función para buscar productos que deberían aparecer pero no aparecen
export async function debugMissingProducts() {
  try {
    console.log('🔍 debugMissingProducts - Analizando productos faltantes...')
    
    // Obtener productos con precio > 0
    const { data: productosConPrecio, error: precioError } = await supabase
      .from('productos')
      .select('*')
      .gt('precio', 0)

    if (precioError) {
      console.error('❌ Error obteniendo productos con precio:', precioError)
      return
    }

    console.log('🔍 Productos con precio > 0:', productosConPrecio?.length || 0)

    // Verificar cuáles tienen relaciones válidas
    const { data: categorias, error: catError } = await supabase
      .from('categoria')
      .select('id')

    const { data: marcas, error: marError } = await supabase
      .from('marcas')
      .select('id')

    if (catError || marError) {
      console.error('❌ Error obteniendo categorías o marcas:', { catError, marError })
      return
    }

    const categoriaIds = new Set(categorias?.map(c => c.id) || [])
    const marcaIds = new Set(marcas?.map(m => m.id) || [])

    const productosValidos = productosConPrecio?.filter(p => 
      categoriaIds.has(p.fk_id_categoria) && marcaIds.has(p.fk_id_marca)
    ) || []

    const productosInvalidos = productosConPrecio?.filter(p => 
      !categoriaIds.has(p.fk_id_categoria) || !marcaIds.has(p.fk_id_marca)
    ) || []

    console.log('🔍 Productos válidos (con relaciones):', productosValidos.length)
    console.log('🔍 Productos inválidos (sin relaciones):', productosInvalidos.length)

    if (productosInvalidos.length > 0) {
      console.log('🔍 Productos que podrían no aparecer:', productosInvalidos.slice(0, 5).map(p => ({
        id: p.id,
        descripcion: p.descripcion,
        precio: p.precio,
        fk_id_categoria: p.fk_id_categoria,
        fk_id_marca: p.fk_id_marca,
        categoria_existe: categoriaIds.has(p.fk_id_categoria),
        marca_existe: marcaIds.has(p.fk_id_marca)
      })))
    }

    return {
      totalConPrecio: productosConPrecio?.length || 0,
      validos: productosValidos.length,
      invalidos: productosInvalidos.length
    }
  } catch (error) {
    console.error('❌ Error en debugMissingProducts:', error)
  }
}
