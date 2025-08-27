"use client"

import { useState, useEffect, useMemo } from "react"
import { use } from "react"
import { Search, Package } from "lucide-react"
import GlobalAppBar from "@/components/GlobalAppBar"
import Footer from "@/components/Footer"
import ProductCard from "@/components/ProductCard"
import Pagination from "@/components/Pagination"
import { useProducts } from "@/hooks/use-products"
import { Categoria } from "@/lib/products"

const PRODUCTS_PER_PAGE = 6

interface CategoriaPageProps {
  params: Promise<{
    categoria: string
  }>
}

export default function CategoriaPage({ params }: CategoriaPageProps) {
  const resolvedParams = use(params)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [animateProducts, setAnimateProducts] = useState(false)

  const { 
    products, 
    categories, 
    loading, 
    error, 
    clearFilters 
  } = useProducts()

  // Obtener parámetros de la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const searchParam = urlParams.get('search')
    
    if (searchParam) {
      setSearchTerm(searchParam)
    }
  }, [])

  // Encontrar la categoría por slug
  const categoria = useMemo(() => {
    return categories.find(cat => {
      const slug = cat.descripcion?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      return slug === resolvedParams.categoria
    })
  }, [categories, resolvedParams.categoria])

  // Filtrar productos por categoría y búsqueda
  const filteredProducts = useMemo(() => {
    if (!categoria) return []
    
    let filtered = products.filter(product => product.fk_id_categoria === categoria.id)

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((product) => {
        const productName = product.descripcion || product.name || ''
        const productDescription = product.descripcion_detallada || product.description || ''

        return productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               productDescription.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    return filtered
  }, [products, categoria, searchTerm])

  // Debug: Log para verificar que los datos se cargan
  useEffect(() => {
    console.log('🔍 Categoría encontrada:', categoria?.descripcion)
    console.log('🔍 Productos filtrados:', filteredProducts.length)
  }, [categoria, filteredProducts])

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1)
    setAnimateProducts(true)
    const timer = setTimeout(() => setAnimateProducts(false), 100)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleClearFilters = () => {
    setSearchTerm("")
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setAnimateProducts(true)
    const timer = setTimeout(() => setAnimateProducts(false), 100)

    // Scroll suave al inicio de los productos
    document.getElementById("productos-grid")?.scrollIntoView({ behavior: "smooth" })

    return () => clearTimeout(timer)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '140px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900">Cargando productos...</h2>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '140px' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar productos</h2>
            <p className="text-xl text-red-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!categoria) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '140px' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Categoría no encontrada</h2>
            <p className="text-xl text-gray-600">La categoría "{resolvedParams.categoria}" no existe</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <GlobalAppBar />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-4" style={{ marginTop: '140px' }}>
        {/* Buscador */}
        <div className="mb-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Buscar en ${categoria.descripcion}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 text-lg placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Header de la página */}
        <div className="mb-8">
          <div className="text-center w-full">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {categoria.descripcion}
            </h1>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `${filteredProducts.length} resultados para "${searchTerm}" en ${categoria.descripcion}`
                : `${filteredProducts.length} productos en ${categoria.descripcion}`
              }
            </p>
            {searchTerm && (
              <div className="mt-2">
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </div>

          {/* Información de resultados */}
          <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
            <span>
              Mostrando {startIndex + 1}-{Math.min(startIndex + PRODUCTS_PER_PAGE, filteredProducts.length)} de {filteredProducts.length} productos
            </span>
            <span>
              Página {currentPage} de {totalPages}
            </span>
          </div>
        </div>

        {/* Grid de Productos */}
        <div id="productos-grid" className="mb-12">
          {filteredProducts.length > 0 ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-300 ${
              animateProducts ? 'opacity-50' : 'opacity-100'
            }`}>
              {paginatedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? `No hay productos que coincidan con "${searchTerm}" en ${categoria.descripcion}`
                  : `No hay productos disponibles en ${categoria.descripcion}`
                }
              </p>
              {searchTerm && (
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}
