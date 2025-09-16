'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { Search, X, Package } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Product } from '@/lib/products'
import { getProducts, getPlanesProducto, calcularCuota, searchCombos, getPlanesCombo } from '@/lib/supabase-products'
import { formatearPrecio } from '@/lib/supabase-products'

interface ProductSearchProps {
  className?: string
}

function ProductSearchContent({ className = '' }: ProductSearchProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [combos, setCombos] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filteredCombos, setFilteredCombos] = useState<any[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincronizar con parámetros de URL cuando estamos en la página de búsqueda
  useEffect(() => {
    if (pathname === '/buscar') {
      const searchQuery = searchParams.get('q') || ''
      setSearchTerm(searchQuery)
      setIsSearchOpen(false) // Cerrar el dropdown cuando se carga desde URL
    }
  }, [pathname, searchParams])

  // Cargar productos al montar el componente
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const productsData = await getProducts()
        setProducts(productsData)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Filtrar productos y combos cuando cambie el término de búsqueda
  useEffect(() => {
    const filterResults = async () => {
      if (!searchTerm.trim()) {
        setFilteredProducts([])
        setFilteredCombos([])
        setIsSearchOpen(false)
        return
      }

      // Filtrar productos
      const filteredProductsResults = products.filter(product => {
        const name = product.descripcion?.toLowerCase() || ''
        const description = product.descripcion_detallada?.toLowerCase() || ''
        const category = product.categoria?.descripcion?.toLowerCase() || ''
        const brand = product.marca?.descripcion?.toLowerCase() || ''
        const searchLower = searchTerm.toLowerCase()

        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               category.includes(searchLower) ||
               brand.includes(searchLower)
      }).slice(0, 8) // Limitar a 8 productos

      // Buscar combos
      try {
        const combosResults = await searchCombos(searchTerm)
        const limitedCombos = combosResults.slice(0, 4) // Limitar a 4 combos

        setFilteredProducts(filteredProductsResults)
        setFilteredCombos(limitedCombos)

        // No abrir automáticamente si estamos en la página de búsqueda
        if (pathname !== '/buscar') {
          setIsSearchOpen(filteredProductsResults.length > 0 || limitedCombos.length > 0)
        }
      } catch (error) {
        console.error('Error searching combos:', error)
        setFilteredProducts(filteredProductsResults)
        setFilteredCombos([])

        if (pathname !== '/buscar') {
          setIsSearchOpen(filteredProductsResults.length > 0)
        }
      }
    }

    filterResults()
  }, [searchTerm, products, pathname])

  // Cerrar búsqueda al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Función para resaltar el texto buscado
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">{part}</span>
      ) : part
    )
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Redirigir a la página de búsqueda global con el término
      window.location.href = `/buscar?q=${encodeURIComponent(searchTerm)}`
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Barra de búsqueda */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (searchTerm.trim() && (filteredProducts.length > 0 || filteredCombos.length > 0)) {
                setIsSearchOpen(true)
              }
            }}
            onClick={() => {
              if (searchTerm.trim() && (filteredProducts.length > 0 || filteredCombos.length > 0)) {
                setIsSearchOpen(true)
              }
            }}
            placeholder="Buscar productos y combos..."
            className="w-full pl-12 pr-12 py-3 bg-white/90 backdrop-blur-sm border border-violet-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setIsSearchOpen(false)
                inputRef.current?.focus()
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
      </form>

      {/* Resultados de búsqueda */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto z-50">
          {/* Combos encontrados */}
          {filteredCombos.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-orange-700 mb-3">Combos ({filteredCombos.length})</h3>
              <div className="space-y-3">
                {filteredCombos.map((combo) => (
                  <Link
                    key={combo.id}
                    href={`/combos/${combo.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    {/* Imagen del combo */}
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4">
                      <img
                        src={combo.imagen || '/placeholder.jpg'}
                        alt={combo.nombre}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Información del combo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-white bg-gradient-to-r from-orange-500 to-orange-600 px-2 py-1 rounded-full font-semibold">
                          COMBO
                        </span>
                        {combo.descuento_porcentaje > 0 && (
                          <span className="text-xs text-white bg-red-500 px-2 py-1 rounded-full font-semibold">
                            -{combo.descuento_porcentaje}%
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {highlightText(combo.nombre || '', searchTerm)}
                      </h4>
                    </div>

                    {/* Precios del combo */}
                    <div className="flex-shrink-0 text-right hidden sm:block">
                      <ComboFinancingPrices combo={combo} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Productos encontrados */}
          {filteredProducts.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Productos ({filteredProducts.length})</h3>
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={product.categoria && product.categoria.descripcion && 
                        !product.categoria.descripcion.toLowerCase().includes('categor') &&
                        product.categoria.descripcion.trim() !== '' ? 
                    `/${product.categoria?.descripcion?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/${product.id}` :
                    `/varios/${product.id}`
                  }
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  {/* Imagen del producto */}
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4">
                    <img
                      src={product.imagen || '/placeholder.jpg'}
                      alt={product.descripcion}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-2">
                      {highlightText(product.descripcion || '', searchTerm)}
                    </h4>
                    <div className="flex items-center mt-1 space-x-1 sm:space-x-2">
                      <span className="text-xs text-gray-500 truncate">
                        {product.categoria?.descripcion}
                      </span>
                      <span className="text-xs text-gray-300 hidden sm:inline">•</span>
                      <span className="text-xs text-gray-500 truncate hidden sm:inline">
                        {product.marca?.descripcion}
                      </span>
                    </div>
                  </div>

                  {/* Precios financiados - oculto en móvil */}
                  <div className="flex-shrink-0 text-right hidden sm:block">
                    <ProductFinancingPrices product={product} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          )}

          {/* Ver todos los resultados */}
          {(filteredProducts.length > 0 || filteredCombos.length > 0) && (
            <div className="p-4 pt-3 border-t border-gray-100">
              <Link
                href={`/buscar?q=${encodeURIComponent(searchTerm)}`}
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center justify-center w-full py-2 px-4 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
              >
                <Package className="size-4 mr-2" />
                Ver todos los resultados
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente para mostrar precios financiados en los resultados de búsqueda
function ProductFinancingPrices({ product }: { product: Product }) {
  const [planes, setPlanes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlanes = async () => {
      try {
        const planesData = await getPlanesProducto(product.id)
        setPlanes(planesData)
      } catch (error) {
        console.error('Error loading financing plans:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPlanes()
  }, [product.id])

  if (loading || planes.length === 0) {
    return null
  }

  // Tomar el primer plan disponible
  const primerPlan = planes[0]
  const calculo = calcularCuota(product.precio || 0, primerPlan)

  if (!calculo) {
    return null
  }

  return (
    <div>
      <div className="text-xs font-bold text-blue-600">
        {primerPlan.cuotas} cuotas mensuales de ${formatearPrecio(calculo.cuota_mensual)}
      </div>
      <div className="text-xs font-bold text-green-600">
        ${formatearPrecio(calculo.cuota_mensual_electro)} P.ELEC
      </div>
    </div>
  )
}

// Componente para mostrar precios financiados de combos en los resultados de búsqueda
function ComboFinancingPrices({ combo }: { combo: any }) {
  const [planes, setPlanes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlanes = async () => {
      try {
        const planesData = await getPlanesCombo(combo.id.toString())
        setPlanes(planesData)
      } catch (error) {
        console.error('Error loading combo financing plans:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPlanes()
  }, [combo.id])

  if (loading || planes.length === 0) {
    return (
      <div>
        <div className="text-xs font-bold text-orange-600">
          ${(combo.precio_combo || 0).toLocaleString()}
        </div>
      </div>
    )
  }

  // Tomar el primer plan disponible
  const primerPlan = planes[0]
  const calculo = calcularCuota(combo.precio_combo || 0, primerPlan)

  if (!calculo) {
    return (
      <div>
        <div className="text-xs font-bold text-orange-600">
          ${(combo.precio_combo || 0).toLocaleString()}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-xs font-bold text-orange-600">
        {primerPlan.cuotas} cuotas mensuales de ${formatearPrecio(calculo.cuota_mensual)}
      </div>
      <div className="text-xs font-bold text-red-600">
        ${formatearPrecio(calculo.cuota_mensual_electro)} P.ELEC
      </div>
    </div>
  )
}

// Componente principal con Suspense
export default function ProductSearch({ className = '' }: ProductSearchProps) {
  return (
    <Suspense fallback={
      <div className={`relative ${className}`}>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            disabled
            className="w-full pl-12 pr-12 py-3 bg-white/90 backdrop-blur-sm border border-violet-200 rounded-full text-gray-900 placeholder-gray-500 opacity-50 cursor-not-allowed"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
        </div>
      </div>
    }>
      <ProductSearchContent className={className} />
    </Suspense>
  )
}
