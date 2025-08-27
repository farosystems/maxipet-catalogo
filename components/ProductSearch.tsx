'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Package } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/lib/products'
import { getProducts, getPlanesProducto, calcularCuota } from '@/lib/supabase-products'
import { formatearPrecio } from '@/lib/supabase-products'

interface ProductSearchProps {
  className?: string
}

export default function ProductSearch({ className = '' }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Filtrar productos cuando cambie el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([])
      setIsSearchOpen(false)
      return
    }

    const filtered = products.filter(product => {
      const name = product.descripcion?.toLowerCase() || ''
      const description = product.descripcion_detallada?.toLowerCase() || ''
      const category = product.categoria?.descripcion?.toLowerCase() || ''
      const brand = product.marca?.descripcion?.toLowerCase() || ''
      const searchLower = searchTerm.toLowerCase()

      return name.includes(searchLower) || 
             description.includes(searchLower) || 
             category.includes(searchLower) || 
             brand.includes(searchLower)
         }).slice(0, 12) // Limitar a 12 resultados

    setFilteredProducts(filtered)
    setIsSearchOpen(filtered.length > 0)
  }, [searchTerm, products])

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
      // Redirigir a la página de cocinas con el término de búsqueda
      window.location.href = `/cocinas?search=${encodeURIComponent(searchTerm)}`
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
            placeholder="Buscar productos..."
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
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[600px] overflow-y-auto z-50">
          {/* Sugerencias de búsqueda */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Sugerencias</h3>
            <div className="space-y-1">
              {filteredProducts.slice(0, 3).map((product) => (
                <button
                  key={`suggestion-${product.id}`}
                  onClick={() => setSearchTerm(product.descripcion || '')}
                  className="flex items-center w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Search className="size-4 mr-3 text-gray-400" />
                  <span>{highlightText(product.descripcion || '', searchTerm)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Productos encontrados */}
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
                  <div className="flex-shrink-0 w-16 h-16 mr-4">
                    <img
                      src={product.imagen || '/placeholder.jpg'}
                      alt={product.descripcion}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-2">
                      {highlightText(product.descripcion || '', searchTerm)}
                    </h4>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500">
                        {product.categoria?.descripcion}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-500">
                        {product.marca?.descripcion}
                      </span>
                    </div>
                  </div>

                  {/* Precios financiados */}
                  <div className="flex-shrink-0 text-right">
                    <ProductFinancingPrices product={product} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Ver todos los resultados */}
            {filteredProducts.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Link
                  href={`/cocinas?search=${encodeURIComponent(searchTerm)}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center justify-center w-full py-2 px-4 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Package className="size-4 mr-2" />
                  Ver todos los resultados
                </Link>
              </div>
            )}
          </div>
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
      <div className="text-sm font-bold text-blue-600">
        ${formatearPrecio(calculo.cuota_mensual)} × {primerPlan.cuotas}
      </div>
      <div className="text-sm font-bold text-green-600">
        ${formatearPrecio(calculo.cuota_mensual_electro)} P.ELEC
      </div>
    </div>
  )
}
