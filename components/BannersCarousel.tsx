"use client"

import { useEffect, useState } from "react"
import { getBanners } from "@/lib/supabase-config"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function BannersCarousel() {
  const [banners, setBanners] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Cargar banners
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setLoading(true)
        const bannersData = await getBanners()
        setBanners(bannersData)
      } catch (error) {
        console.error('Error al cargar banners:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBanners()
  }, [])

  // Auto-deslizamiento
  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 4000) // Cambia cada 4 segundos

    return () => clearInterval(interval)
  }, [banners.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Si no hay banners, no mostrar nada
  if (loading || banners.length === 0) {
    return null
  }

  return (
    <section className="py-8" style={{ background: 'linear-gradient(135deg, #f0f9ff, #dbeafe, #f0f9ff)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative group">
          {/* Contenedor del carrusel */}
          <div className="relative overflow-hidden rounded-2xl aspect-[16/6] md:aspect-[21/6] border-8" style={{ boxShadow: '0 20px 60px rgba(0, 112, 187, 0.5)', borderColor: '#0070bb' }}>
            {/* Banners */}
            <div
              className="flex transition-transform duration-700 ease-in-out h-full"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {banners.map((banner, index) => (
                <div
                  key={index}
                  className="min-w-full h-full flex-shrink-0"
                >
                  <img
                    src={banner}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Botones de navegación - Solo si hay más de 1 banner */}
            {banners.length > 1 && (
              <>
                {/* Botón Anterior */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-label="Banner anterior"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Botón Siguiente */}
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-label="Banner siguiente"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Indicadores - Solo si hay más de 1 banner */}
          {banners.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? "w-8 h-3"
                      : "bg-gray-300 hover:bg-gray-400 w-3 h-3"
                  }`}
                  style={index === currentIndex ? { backgroundColor: '#0070bb' } : {}}
                  aria-label={`Ir al banner ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
