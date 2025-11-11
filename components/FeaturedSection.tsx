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
      <section className="py-20 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-emerald-100">Cargando productos destacados...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-700 text-white">
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
      className="pt-8 pb-20 text-white relative overflow-hidden"
    >
      {/* Imagen de fondo de la familia */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-family.jpg')"
        }}
      >
        {/* Overlay para mantener legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/80 via-emerald-600/70 to-emerald-700/80"></div>
      </div>

      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-400 rounded-full blur-3xl animate-float delay-200"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent whitespace-nowrap">
            {tituloSeccion}
          </h2>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Los electrodomésticos más vendidos y preferidos por nuestros clientes
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mt-4 rounded-full animate-pulse-glow"></div>
        </div>

        {/* Contador de productos destacados */}
        <div className="mb-8 text-center mt-4">
          <p className="text-emerald-100">
            <span className="font-semibold text-yellow-300">{featuredProducts.length}</span> productos destacados
          </p>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center">
            <p className="text-xl text-emerald-100">No hay productos destacados disponibles</p>
          </div>
        ) : (
          <div className="px-12">
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
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  )
}
