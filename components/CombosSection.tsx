"use client"

import { useEffect, useState, useRef } from "react"
import ComboCard from "./ComboCard"
import Pagination from "./Pagination"
import { getCombosVigentes } from "@/lib/supabase-products"
import { Combo } from "@/lib/products"

const COMBOS_PER_PAGE = 3

export default function CombosSection() {
  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Cargar combos vigentes
  useEffect(() => {
    const loadCombos = async () => {
      try {
        setLoading(true)
        setError(null)
        const combosData = await getCombosVigentes()
        setCombos(combosData)
      } catch (err) {
        setError('Error al cargar los combos')
      } finally {
        setLoading(false)
      }
    }

    loadCombos()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-violet-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              Combos Especiales
            </h2>
            <p className="text-xl text-violet-100">Cargando combos...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-violet-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              Combos Especiales
            </h2>
            <p className="text-xl text-red-300">Error al cargar los combos: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  // Si no hay combos, no mostrar la sección
  if (combos.length === 0) {
    return null
  }

  // Calcular paginación para combos
  const totalPages = Math.ceil(combos.length / COMBOS_PER_PAGE)
  const startIndex = (currentPage - 1) * COMBOS_PER_PAGE
  const displayCombos = combos.slice(startIndex, startIndex + COMBOS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll suave a la sección de combos
    document.getElementById("combos")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="combos"
      className="py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-violet-800 text-white relative overflow-hidden"
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-violet-400 rounded-full blur-3xl animate-float delay-200"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
            Combos Especiales
          </h2>
          <p className="text-xl text-violet-100 max-w-2xl mx-auto">
            Aprovechá nuestros combos con descuentos especiales y ahorrá en grande
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mt-4 rounded-full animate-pulse-glow"></div>
        </div>

        {/* Contador de combos */}
        <div className="mb-8 text-center">
          <p className="text-violet-100">
            <span className="md:hidden">
              <span className="font-semibold text-white">{combos.length}</span> combos disponibles
            </span>
            <span className="hidden md:inline">
              Mostrando <span className="font-semibold text-white">{displayCombos.length}</span> de{" "}
              <span className="font-semibold text-white">{combos.length}</span> combos disponibles
            </span>
          </p>
        </div>

        {/* Carrusel para móviles */}
        <div className="md:hidden">
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-4 px-4">
              {combos.map((combo) => (
                <div
                  key={combo.id}
                  className="flex-shrink-0 w-64"
                >
                  <ComboCard combo={combo} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid para desktop */}
        <div className="hidden md:block">
          <div className={`grid gap-8 ${
            displayCombos.length === 1
              ? "grid-cols-1 justify-items-center"
              : "grid-cols-2 lg:grid-cols-3"
          }`}>
            {displayCombos.map((combo, index) => (
              <div
                key={`${combo.id}-${currentPage}`}
                className={`transition-all duration-700 ${
                  displayCombos.length === 1
                    ? "w-96 mx-auto"
                    : ""
                } ${
                  index === 0
                    ? "delay-100 animate-fade-in-up"
                    : index === 1
                      ? "delay-200 animate-fade-in-up"
                      : "delay-300 animate-fade-in-up"
                }`}
              >
                <ComboCard combo={combo} />
              </div>
            ))}
          </div>

          {/* Paginación para desktop */}
          {combos.length > COMBOS_PER_PAGE && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}