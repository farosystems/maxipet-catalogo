'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight, ArrowLeft, X, Filter } from 'lucide-react'
import Link from 'next/link'
import { Categoria, Linea, Marca } from '@/lib/products'
import { getLineasWithCategorias, getCategoriasWithoutLinea, getBrands } from '@/lib/supabase-products'

interface FiltersDropdownProps {
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
}

type FilterType = 'categoria' | 'marca' | 'tamaño' | 'kilos' | null

export default function FiltersDropdown({ isOpen, onClose, isMobile: isMobileProp }: FiltersDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [lineasWithCategorias, setLineasWithCategorias] = useState<(Linea & { categorias: Categoria[] })[]>([])
  const [categoriasWithoutLinea, setCategoriasWithoutLinea] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(null)
  const [selectedLinea, setSelectedLinea] = useState<(Linea & { categorias: Categoria[] }) | null>(null)
  const [hoveredLinea, setHoveredLinea] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isReallyMobile = isMobileProp !== undefined ? isMobileProp : isMobile

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [lineasData, categoriasData, marcasData] = await Promise.all([
          getLineasWithCategorias(),
          getCategoriasWithoutLinea(),
          getBrands()
        ])
        setLineasWithCategorias(lineasData)
        setCategoriasWithoutLinea(categoriasData)
        setMarcas(marcasData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    if (isReallyMobile && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isReallyMobile, isOpen])

  useEffect(() => {
    if (isReallyMobile) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return
      }
      const submenus = document.querySelectorAll('[data-submenu]')
      for (let submenu of submenus) {
        if (submenu.contains(target)) {
          return
        }
      }
      onClose()
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, isReallyMobile])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleLineaMouseEnter = (lineaId: number) => {
    if (isReallyMobile) return
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setHoveredLinea(lineaId)
  }

  const handleLineaMouseLeave = () => {
    if (isReallyMobile) return
    timeoutRef.current = setTimeout(() => {
      setHoveredLinea(null)
    }, 800)
  }

  const handleSubmenuMouseEnter = () => {
    if (isReallyMobile) return
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleSubmenuMouseLeave = () => {
    if (isReallyMobile) return
    setHoveredLinea(null)
  }

  const handleLineaClick = (linea: Linea & { categorias: Categoria[] }) => {
    if (isReallyMobile) {
      if (linea.categorias.length > 0) {
        setSelectedLinea(linea)
      } else {
        const slug = generateSlug(linea.descripcion)
        window.location.href = `/lineas/${slug}`
        onClose()
      }
    } else {
      const slug = generateSlug(linea.descripcion)
      window.location.href = `/lineas/${slug}`
      onClose()
    }
  }

  const handleBackToMain = () => {
    setSelectedFilter(null)
    setSelectedLinea(null)
  }

  const handleFilterSelect = (filter: FilterType) => {
    if (isReallyMobile) {
      setSelectedFilter(filter)
    }
  }

  if (!isOpen) return null

  const generateSlug = (descripcion: string) => {
    return descripcion?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const tamañosDisponibles = ['Pequeño', 'Mediano', 'Grande', 'Extra Grande']
  const kilosDisponibles = ['1kg', '3kg', '5kg', '10kg', '15kg', '20kg']

  // Mobile modal
  if (isReallyMobile && isClient) {
    return createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" style={{ zIndex: 99999 }}>
        <div className="bg-white w-full h-full flex flex-col relative overflow-hidden">

          {/* Vista principal de filtros */}
          <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
            selectedFilter ? '-translate-x-full' : 'translate-x-0'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Filtros</h2>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => handleFilterSelect('categoria')}
                    className="w-full flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-colors group border border-gray-200 hover:border-blue-300"
                  >
                    <span className="text-gray-900 group-hover:text-blue-700 font-medium text-lg">
                      Por Categoría
                    </span>
                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-6" />
                  </button>

                  <button
                    onClick={() => handleFilterSelect('marca')}
                    className="w-full flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-colors group border border-gray-200 hover:border-blue-300"
                  >
                    <span className="text-gray-900 group-hover:text-blue-700 font-medium text-lg">
                      Por Marca
                    </span>
                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-6" />
                  </button>

                  <button
                    onClick={() => handleFilterSelect('tamaño')}
                    className="w-full flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-colors group border border-gray-200 hover:border-blue-300"
                  >
                    <span className="text-gray-900 group-hover:text-blue-700 font-medium text-lg">
                      Por Tamaño
                    </span>
                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-6" />
                  </button>

                  <button
                    onClick={() => handleFilterSelect('kilos')}
                    className="w-full flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-colors group border border-gray-200 hover:border-blue-300"
                  >
                    <span className="text-gray-900 group-hover:text-blue-700 font-medium text-lg">
                      Por Kilos
                    </span>
                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-6" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Vista de categorías */}
          <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
            selectedFilter === 'categoria' && !selectedLinea ? 'translate-x-0' : selectedFilter === 'categoria' ? '-translate-x-full' : 'translate-x-full'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center gap-3">
              <button onClick={handleBackToMain} className="text-white/80 hover:text-white">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold flex-1">Líneas</h2>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {lineasWithCategorias.map((linea) => (
                  <button
                    key={linea.id}
                    onClick={() => handleLineaClick(linea)}
                    className="w-full flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-colors group border border-gray-200 hover:border-blue-300"
                  >
                    <span className="text-gray-900 group-hover:text-blue-700 font-medium text-lg">
                      {linea.descripcion}
                    </span>
                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-6" />
                  </button>
                ))}
                {categoriasWithoutLinea.map((category) => {
                  const slug = generateSlug(category.descripcion)
                  return (
                    <Link
                      key={category.id}
                      href={`/${slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-colors group border border-gray-200 hover:border-blue-300"
                    >
                      <span className="text-gray-900 group-hover:text-blue-700 font-medium text-lg">
                        {category.descripcion}
                      </span>
                      <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-6" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Vista de categorías de una línea */}
          <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
            selectedLinea ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center gap-3">
              <button onClick={() => setSelectedLinea(null)} className="text-white/80 hover:text-white">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold flex-1">{selectedLinea?.descripcion}</h2>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {selectedLinea && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {selectedLinea.categorias.map((category) => {
                    const slug = generateSlug(category.descripcion)
                    return (
                      <Link
                        key={category.id}
                        href={`/${slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-colors group border border-gray-200 hover:border-blue-300"
                      >
                        <span className="text-gray-900 group-hover:text-blue-700 font-medium text-lg">
                          {category.descripcion}
                        </span>
                        <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-6" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Vista de marcas */}
          <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
            selectedFilter === 'marca' ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center gap-3">
              <button onClick={handleBackToMain} className="text-white/80 hover:text-white">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold flex-1">Marcas</h2>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {marcas.map((marca) => (
                  <Link
                    key={marca.id}
                    href={`/marcas/${marca.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-colors group border border-gray-200 hover:border-blue-300"
                  >
                    <span className="text-gray-900 group-hover:text-blue-700 font-medium text-lg">
                      {marca.descripcion}
                    </span>
                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-6" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Vista de tamaños */}
          <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
            selectedFilter === 'tamaño' ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center gap-3">
              <button onClick={handleBackToMain} className="text-white/80 hover:text-white">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold flex-1">Tamaños</h2>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {tamañosDisponibles.map((tamaño) => (
                  <Link
                    key={tamaño}
                    href={`/tamano/${tamaño.toLowerCase().replace(' ', '-')}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-colors group border border-gray-200 hover:border-blue-300"
                  >
                    <span className="text-gray-900 group-hover:text-blue-700 font-medium text-lg">
                      {tamaño}
                    </span>
                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-6" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Vista de kilos */}
          <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
            selectedFilter === 'kilos' ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center gap-3">
              <button onClick={handleBackToMain} className="text-white/80 hover:text-white">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold flex-1">Kilos</h2>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {kilosDisponibles.map((kilo) => (
                  <Link
                    key={kilo}
                    href={`/kilos/${kilo}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-colors group border border-gray-200 hover:border-blue-300"
                  >
                    <span className="text-gray-900 group-hover:text-blue-700 font-medium text-lg">
                      {kilo}
                    </span>
                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-6" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>,
      document.body
    )
  }

  // Desktop view
  return (
    <div
      ref={dropdownRef}
      className="bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-full max-w-[420px] min-w-[350px] relative overflow-visible max-h-[70vh] flex flex-col"
    >
      <div className="p-4 flex-shrink-0">
        <h3 className="text-base font-bold text-gray-900 px-2 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-visible px-4 pb-4">
          <div className="space-y-4">

            {/* Filtro por Categoría */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">Por Categoría</h4>
              <div className="space-y-1">
                {lineasWithCategorias.map((linea) => (
                  <div
                    key={linea.id}
                    className="relative"
                    data-linea-id={linea.id}
                    onMouseEnter={() => handleLineaMouseEnter(linea.id)}
                    onMouseLeave={handleLineaMouseLeave}
                  >
                    <div
                      onClick={() => handleLineaClick(linea)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors group border border-transparent hover:border-blue-200 cursor-pointer"
                    >
                      <span className="text-gray-900 group-hover:text-blue-600 font-semibold text-sm">
                        {linea.descripcion}
                      </span>
                      <div className="flex items-center gap-2">
                        {linea.categorias.length > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {linea.categorias.length}
                          </span>
                        )}
                        <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-4 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                ))}
                {categoriasWithoutLinea.map((category) => {
                  const slug = generateSlug(category.descripcion)
                  return (
                    <Link
                      key={category.id}
                      href={`/${slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors group border border-transparent hover:border-blue-200"
                    >
                      <span className="text-gray-700 group-hover:text-blue-600 font-medium text-sm">
                        {category.descripcion}
                      </span>
                      <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Filtro por Marca */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">Por Marca</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {marcas.map((marca) => (
                  <Link
                    key={marca.id}
                    href={`/marcas/${marca.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors group border border-transparent hover:border-blue-200"
                  >
                    <span className="text-gray-700 group-hover:text-blue-600 font-medium text-sm">
                      {marca.descripcion}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Filtro por Tamaño */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">Por Tamaño</h4>
              <div className="space-y-1">
                {tamañosDisponibles.map((tamaño) => (
                  <Link
                    key={tamaño}
                    href={`/tamano/${tamaño.toLowerCase().replace(' ', '-')}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors group border border-transparent hover:border-blue-200"
                  >
                    <span className="text-gray-700 group-hover:text-blue-600 font-medium text-sm">
                      {tamaño}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Filtro por Kilos */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">Por Kilos</h4>
              <div className="space-y-1">
                {kilosDisponibles.map((kilo) => (
                  <Link
                    key={kilo}
                    href={`/kilos/${kilo}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors group border border-transparent hover:border-blue-200"
                  >
                    <span className="text-gray-700 group-hover:text-blue-600 font-medium text-sm">
                      {kilo}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Submenús de categorías para desktop */}
      {hoveredLinea && isClient && createPortal(
        (() => {
          const linea = lineasWithCategorias.find(l => l.id === hoveredLinea)
          if (!linea || linea.categorias.length === 0) return null

          const dropdownRect = dropdownRef.current?.getBoundingClientRect()
          const hoveredElement = dropdownRef.current?.querySelector(`[data-linea-id="${hoveredLinea}"]`)
          const hoveredRect = hoveredElement?.getBoundingClientRect()

          if (!dropdownRect || !hoveredRect) return null

          const left = dropdownRect.right + 2
          const top = hoveredRect.top

          return (
            <div
              data-submenu
              className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 min-w-[280px] max-w-[360px]"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                zIndex: 9999
              }}
              onMouseEnter={handleSubmenuMouseEnter}
              onMouseLeave={handleSubmenuMouseLeave}
            >
              <div className="p-3">
                <div className="space-y-0.5 max-h-[280px] overflow-y-auto">
                  {linea.categorias.map((category) => {
                    const slug = generateSlug(category.descripcion)
                    return (
                      <Link
                        key={category.id}
                        href={`/${slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between px-2 py-1.5 hover:bg-blue-50 rounded-lg transition-colors group border border-transparent hover:border-blue-200"
                      >
                        <span className="text-gray-700 group-hover:text-blue-600 font-medium text-xs">
                          {category.descripcion}
                        </span>
                        <ChevronRight className="text-gray-400 group-hover:text-blue-600 size-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })(),
        document.body
      )}
    </div>
  )
}
