"use client"

import { useEffect, useState, useMemo } from "react"
import ProductCard from "./ProductCard"
import FilterBar from "./FilterBar"
import Pagination from "./Pagination"
import { useProducts } from "@/hooks/use-products"
import { debugPriceRangeIssue, debugActiveFilters } from "@/lib/debug-price-range"

const PRODUCTS_PER_PAGE = 3

export default function ProductsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [animateProducts, setAnimateProducts] = useState(false)

  const { 
    products, 
    categories, 
    brands, 
    loading, 
    error, 
    filterByCategory, 
    filterByBrand, 
    clearFilters 
  } = useProducts()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("productos")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  // Debug inicial del componente
  useEffect(() => {
    console.log('🔍 ProductsSection - Debug inicial')
    debugPriceRangeIssue()
    debugActiveFilters(searchTerm, selectedCategory, selectedBrand, [0, 1000000])
  }, [])

  // Filtrar productos localmente (búsqueda y solo excluir precio = 0)
  const filteredProducts = useMemo(() => {
    console.log('🔍 ProductsSection - Filtrando productos:', {
      totalProducts: products.length,
      searchTerm,
      selectedCategory,
      selectedBrand
    })

    // Contadores para debug
    let productosExcluidosPorBusqueda = 0
    let productosExcluidosPorPrecioCero = 0

    const filtered = products.filter((product) => {
      const productName = product.descripcion || product.name || ''
      const productDescription = product.descripcion_detallada || product.description || ''
      const productPrice = product.precio || product.price || 0

      // Solo excluir productos con precio = 0
      const precioValido = productPrice > 0
      
      // Búsqueda por texto (solo si hay término de búsqueda)
      const matchesSearch = !searchTerm || 
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productDescription.toLowerCase().includes(searchTerm.toLowerCase())

      // Contar productos excluidos
      if (!precioValido) {
        productosExcluidosPorPrecioCero++
      } else if (searchTerm && !matchesSearch) {
        productosExcluidosPorBusqueda++
      }

      // Debug para productos específicos (solo los primeros 5 para no saturar la consola)
      if (searchTerm && !matchesSearch && productosExcluidosPorBusqueda <= 5) {
        console.log('🔍 Producto no coincide con búsqueda:', {
          id: product.id,
          name: productName,
          description: productDescription,
          searchTerm,
          matchesSearch
        })
      }

      if (!precioValido && productosExcluidosPorPrecioCero <= 5) {
        console.log('🔍 Producto excluido por precio = 0:', {
          id: product.id,
          name: productName,
          price: productPrice
        })
      }

      return precioValido && matchesSearch
    })

    console.log('🔍 ProductsSection - Resumen de filtrado:', {
      totalProducts: products.length,
      totalFiltered: filtered.length,
      productosExcluidosPorPrecioCero,
      productosExcluidosPorBusqueda,
      searchTerm: searchTerm || 'sin búsqueda'
    })

    return filtered
  }, [products, searchTerm])

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
  }, [searchTerm, selectedCategory, selectedBrand])

  const handleCategoryChange = async (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    await filterByCategory(categoryId)
  }

  const handleBrandChange = async (brandId: number | null) => {
    setSelectedBrand(brandId)
    await filterByBrand(brandId)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedCategory(null)
    setSelectedBrand(null)
    setCurrentPage(1)
    clearFilters()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setAnimateProducts(true)
    const timer = setTimeout(() => setAnimateProducts(false), 100)

    // Scroll suave a la sección de productos
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })

    return () => clearTimeout(timer)
  }

  if (loading) {
    return (
      <section id="productos" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nuestros Productos
            </h2>
            <p className="text-xl text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="productos" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nuestros Productos
            </h2>
            <p className="text-xl text-red-600">Error al cargar los productos: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="productos" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nuestros Productos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra amplia gama de electrodomésticos con los mejores planes de financiación
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Barra de filtros */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            selectedBrand={selectedBrand}
            setSelectedBrand={handleBrandChange}
            onClearFilters={handleClearFilters}
            categories={categories}
            brands={brands}
          />
        </div>

        {/* Contador de resultados */}
        <div className={`mb-8 transition-all duration-500 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Mostrando <span className="font-semibold text-blue-600">{paginatedProducts.length}</span> de{" "}
              <span className="font-semibold text-blue-600">{filteredProducts.length}</span> productos
            </p>
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 animate-scale-in">
                <p className="text-gray-500 text-lg">No se encontraron productos que coincidan con los filtros.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grid de productos */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedProducts.map((product, index) => (
              <div
                key={`${product.id}-${currentPage}`}
                className={`transition-all duration-700 ${
                  animateProducts
                    ? "opacity-0 transform translate-y-4"
                    : index === 0
                      ? "delay-100 animate-fade-in-up"
                      : index === 1
                        ? "delay-200 animate-fade-in-up"
                        : index === 2
                          ? "delay-300 animate-fade-in-up"
                          : index === 3
                            ? "delay-500 animate-fade-in-up"
                            : index === 4
                              ? "delay-700 animate-fade-in-up"
                              : "delay-1000 animate-fade-in-up"
                } ${isVisible ? "" : "opacity-0"}`}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {filteredProducts.length > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>
    </section>
  )
}
