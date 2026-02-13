"use client"

import { useEffect, useState } from "react"
import ProductCard from "./ProductCard"
import { getFeaturedProducts } from "@/lib/supabase-products"
import { getTituloSeccionDestacados } from "@/lib/supabase-config"
import { Product } from "@/lib/products"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function FeaturedSection() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tituloSeccion, setTituloSeccion] = useState<string>('Productos Destacados')


  // Cargar productos destacados y título
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [products, titulo] = await Promise.all([
          getFeaturedProducts(),
          getTituloSeccionDestacados()
        ])
        setFeaturedProducts(products)
        setTituloSeccion(titulo)
      } catch (err) {
        setError('Error al cargar los productos destacados')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])


  if (loading) {
    return (
      <section className="py-20 text-white" style={{ background: 'linear-gradient(135deg, #005a8d, #0070bb, #005a8d)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-blue-100">Cargando productos destacados...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 text-white" style={{ background: 'linear-gradient(135deg, #005a8d, #0070bb, #005a8d)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-red-300">Error al cargar los productos: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="destacados"
      className="pt-8 pb-20 text-white relative"
    >
      {/* Imagen de fondo de la familia */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-family.webp')"
        }}
      >
        {/* Overlay para mantener legibilidad */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0, 90, 141, 0.85), rgba(0, 112, 187, 0.75), rgba(0, 90, 141, 0.85))' }}></div>
      </div>

      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl animate-float delay-200"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent whitespace-nowrap">
            {tituloSeccion}
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            El alimento para perros y gatos más vendido y preferido por nuestros clientes
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mt-4 rounded-full animate-pulse-glow"></div>
        </div>

        {/* Contador de productos destacados */}
        <div className="mb-8 text-center mt-4">
          <p className="text-blue-100">
            <span className="font-semibold text-yellow-300">{featuredProducts.length}</span> productos destacados
          </p>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center">
            <p className="text-xl text-blue-100">No hay productos destacados disponibles</p>
          </div>
        ) : (
          <div className="py-4">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {featuredProducts.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="pl-4 py-3 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-12 lg:-left-16 h-12 w-12 bg-white/90 hover:bg-white" />
              <CarouselNext className="-right-12 lg:-right-16 h-12 w-12 bg-white/90 hover:bg-white" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  )
}
