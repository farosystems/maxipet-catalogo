"use client"

import { useState, useEffect, useMemo } from "react"
import { use } from "react"
import { Search, Package } from "lucide-react"
import GlobalAppBar from "@/components/GlobalAppBar"
import Footer from "@/components/Footer"
import ProductCard from "@/components/ProductCard"
import ComboCard from "@/components/ComboCard"
import Pagination from "@/components/Pagination"
import { useProducts } from "@/hooks/use-products"
import { getCombosByCategory } from "@/lib/supabase-products"
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
  const [combos, setCombos] = useState<any[]>([])
  const [combosLoading, setCombosLoading] = useState(true)

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

  // Filtrar productos por categoría
  const filteredProducts = useMemo(() => {
    if (!categoria) return []
    
    return products.filter(product => product.fk_id_categoria === categoria.id)
  }, [products, categoria])

  // Cargar combos de la categoría
  useEffect(() => {
    const loadCombos = async () => {
      if (!categoria) {
        setCombos([])
        setCombosLoading(false)
        return
      }

      try {
        setCombosLoading(true)
        console.log('🔍 Cargando combos para categoría:', categoria.id)
        const combosData = await getCombosByCategory(categoria.id)
        console.log('🔍 Combos cargados:', combosData.length)
        setCombos(combosData)
      } catch (error) {
        console.error('Error loading combos:', error)
        setCombos([])
      } finally {
        setCombosLoading(false)
      }
    }

    loadCombos()
  }, [categoria])

  // Debug: Log para verificar que los datos se cargan
  useEffect(() => {
    console.log('🔍 Categoría encontrada:', categoria?.descripcion)
    console.log('🔍 Productos filtrados:', filteredProducts.length)
    console.log('🔍 Combos filtrados:', combos.length)
  }, [categoria, filteredProducts, combos])

  // Combinar productos y combos para mostrar juntos
  const allItems = useMemo(() => {
    // Combinar productos y combos, ordenando por tipo (combos primero) y luego por fecha/nombre
    const items = [
      ...combos.map(combo => ({ ...combo, type: 'combo' })),
      ...filteredProducts.map(product => ({ ...product, type: 'product' }))
    ]
    return items
  }, [combos, filteredProducts])

  // Calcular paginación para todos los items
  const totalPages = Math.ceil(allItems.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const paginatedItems = allItems.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)

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

  if (loading || combosLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '140px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900">Cargando productos y combos...</h2>
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
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-4" style={{ marginTop: '40px' }}>
        {/* Header de la página */}
        <div className="mb-6">
          <div className="text-center w-full">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {categoria.descripcion}
            </h1>
          </div>
        </div>


        {/* Información de resultados */}
        <div className="mb-8">
          <div className="text-center w-full">
            <p className="text-gray-600 mb-4">
              {filteredProducts.length} productos{combos.length > 0 ? ` y ${combos.length} combos` : ''} en {categoria.descripcion}
            </p>
          </div>

          {/* Información de paginación */}
          <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
            <span>
              Mostrando {startIndex + 1}-{Math.min(startIndex + PRODUCTS_PER_PAGE, allItems.length)} de {allItems.length} elementos
            </span>
            <span>
              Página {currentPage} de {totalPages}
            </span>
          </div>
        </div>

        {/* Grid de Productos y Combos */}
        <div id="productos-grid" className="mb-12">
          {allItems.length > 0 ? (
            <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 transition-all duration-300 ${
              animateProducts ? 'opacity-50' : 'opacity-100'
            }`}>
              {paginatedItems.map((item, index) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.type === 'combo' ? (
                    <ComboCard combo={item} />
                  ) : (
                    <ProductCard product={item} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay productos o combos disponibles
              </h3>
              <p className="text-gray-500 mb-6">
                No hay productos o combos disponibles en {categoria.descripcion}
              </p>
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
