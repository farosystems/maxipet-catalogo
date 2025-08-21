"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Filter, X, ChevronDown, SlidersHorizontal } from "lucide-react"
import { Categoria, Marca } from "@/lib/products"

interface FilterBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: number | null
  setSelectedCategory: (categoryId: number | null) => void
  selectedBrand: number | null
  setSelectedBrand: (brandId: number | null) => void
  onClearFilters: () => void
  categories?: Categoria[]
  brands?: Marca[]
}

export default function FilterBar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  onClearFilters,
  categories = [],
  brands = [],
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  
  const categoryRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const hasActiveFilters =
    searchTerm ||
    selectedCategory !== null ||
    selectedBrand !== null

  // Obtener nombres de categoría y marca seleccionadas
  const selectedCategoryName = selectedCategory
    ? categories.find(cat => cat.id === selectedCategory)?.descripcion || 'Seleccionada'
    : 'Todas las categorías'
  const selectedBrandName = selectedBrand
    ? brands.find(brand => brand.id === selectedBrand)?.descripcion || 'Seleccionada'
    : 'Todas las marcas'

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 relative">
      {/* Barra de búsqueda principal */}
      <div className="flex flex-col lg:flex-row gap-4 items-center mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
            showFilters 
              ? "bg-blue-600 text-white shadow-lg" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <SlidersHorizontal size={20} />
          Filtros
          <ChevronDown className={`transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} size={16} />
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-4 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-300 font-medium"
          >
            <X size={16} />
            Limpiar
          </button>
        )}
      </div>

      {/* Panel de filtros expandible */}
      <div
        className={`transition-all duration-500 ${
          showFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
          {/* Filtro por categoría */}
          <div className="relative" ref={categoryRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Categoría
            </label>
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown)
                setShowBrandDropdown(false)
              }}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-left flex items-center justify-between hover:bg-gray-100 hover:border-gray-300 transition-all duration-300"
            >
              <span className={selectedCategory === null ? "text-gray-500" : "text-gray-900 font-medium"}>
                {selectedCategoryName}
              </span>
              <ChevronDown
                className={`transition-transform duration-300 text-gray-400 ${showCategoryDropdown ? "rotate-180" : ""}`}
                size={16}
              />
            </button>

            {/* Dropdown de categorías */}
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 filter-dropdown">
                <div className="max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory(null)
                      setShowCategoryDropdown(false)
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 ${
                      selectedCategory === null ? "bg-blue-100 text-blue-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    Todas las categorías
                  </button>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setShowCategoryDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                          selectedCategory === category.id ? "bg-blue-100 text-blue-600 font-medium" : "text-gray-700"
                        }`}
                      >
                        {category.descripcion}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No hay categorías disponibles
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Filtro por marca */}
          <div className="relative" ref={brandRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Marca
            </label>
            <button
              onClick={() => {
                setShowBrandDropdown(!showBrandDropdown)
                setShowCategoryDropdown(false)
              }}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-left flex items-center justify-between hover:bg-gray-100 hover:border-gray-300 transition-all duration-300"
            >
              <span className={selectedBrand === null ? "text-gray-500" : "text-gray-900 font-medium"}>
                {selectedBrandName}
              </span>
              <ChevronDown
                className={`transition-transform duration-300 text-gray-400 ${showBrandDropdown ? "rotate-180" : ""}`}
                size={16}
              />
            </button>

            {/* Dropdown de marcas */}
            {showBrandDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 filter-dropdown">
                <div className="max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedBrand(null)
                      setShowBrandDropdown(false)
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 ${
                      selectedBrand === null ? "bg-blue-100 text-blue-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    Todas las marcas
                  </button>
                  {brands.length > 0 ? (
                    brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => {
                          setSelectedBrand(brand.id)
                          setShowBrandDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                          selectedBrand === brand.id ? "bg-blue-100 text-blue-600 font-medium" : "text-gray-700"
                        }`}
                      >
                        {brand.descripcion}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No hay marcas disponibles
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>


        </div>

        {/* Contador de filtros activos */}
        {hasActiveFilters && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              <span>
                Filtros activos: 
                {searchTerm && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-md">Búsqueda</span>}
                {selectedCategory && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-md">Categoría</span>}
                {selectedBrand && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-md">Marca</span>}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
