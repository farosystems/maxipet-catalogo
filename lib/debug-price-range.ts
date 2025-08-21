// Debug específico para el problema del priceRange
export function debugPriceRangeIssue() {
  console.log('🔍 DEBUG PRICE RANGE ISSUE')
  console.log('🔍 Verificando valores por defecto...')
  
  // Simular el priceRange por defecto
  const defaultPriceRange: [number, number] = [0, 1000000]
  console.log('🔍 PriceRange por defecto:', defaultPriceRange)
  console.log('🔍 PriceRange[0] > 0:', defaultPriceRange[0] > 0)
  console.log('🔍 PriceRange[1] < 1000000:', defaultPriceRange[1] < 1000000)
  
  // Verificar si hay algún problema con el tipo de datos
  console.log('🔍 Tipo de priceRange[0]:', typeof defaultPriceRange[0])
  console.log('🔍 Tipo de priceRange[1]:', typeof defaultPriceRange[1])
  
  // Verificar si hay algún problema con la comparación
  console.log('🔍 0 === 0:', 0 === 0)
  console.log('🔍 0 > 0:', 0 > 0)
  console.log('🔍 0 >= 0:', 0 >= 0)
  
  // Verificar si hay algún problema con el valor 1000000
  console.log('🔍 1000000 === 1000000:', 1000000 === 1000000)
  console.log('🔍 1000000 < 1000000:', 1000000 < 1000000)
  console.log('🔍 1000000 <= 1000000:', 1000000 <= 1000000)
  
  return {
    defaultPriceRange,
    minPriceType: typeof defaultPriceRange[0],
    maxPriceType: typeof defaultPriceRange[1],
    minPriceGreaterThanZero: defaultPriceRange[0] > 0,
    maxPriceLessThanMillion: defaultPriceRange[1] < 1000000
  }
}

// Función para verificar si hay algún filtro activo que no debería estar
export function debugActiveFilters(searchTerm: string, selectedCategory: number | null, selectedBrand: number | null, priceRange: [number, number]) {
  console.log('🔍 DEBUG ACTIVE FILTERS')
  console.log('🔍 Valores actuales:', {
    searchTerm,
    selectedCategory,
    selectedBrand,
    priceRange
  })
  
  const hasSearchTerm = !!searchTerm
  const hasCategory = selectedCategory !== null
  const hasBrand = selectedBrand !== null
  const hasPriceFilter = priceRange[0] > 0 || priceRange[1] < 1000000
  
  console.log('🔍 Análisis de filtros:', {
    hasSearchTerm,
    hasCategory,
    hasBrand,
    hasPriceFilter,
    priceRangeMin: priceRange[0],
    priceRangeMax: priceRange[1],
    minPriceGreaterThanZero: priceRange[0] > 0,
    maxPriceLessThanMillion: priceRange[1] < 1000000
  })
  
  const hasActiveFilters = hasSearchTerm || hasCategory || hasBrand || hasPriceFilter
  console.log('🔍 ¿Hay filtros activos?', hasActiveFilters)
  
  return {
    hasSearchTerm,
    hasCategory,
    hasBrand,
    hasPriceFilter,
    hasActiveFilters
  }
}
