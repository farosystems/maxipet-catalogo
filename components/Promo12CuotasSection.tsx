"use client"

import { useEffect, useState } from "react"
import ProductCard from "./ProductCard"
import { getProductosHomeDinamicos, getPlanHomeDinamico } from "@/lib/supabase-products"
import { getTituloSeccionPromos } from "@/lib/supabase-config"
import { PlanFinanciacion } from "@/lib/products"
import { Product } from "@/lib/products"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function Promo12CuotasSection() {
  const [promoProducts, setPromoProducts] = useState<Product[]>([])
  const [planInfo, setPlanInfo] = useState<PlanFinanciacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tituloSeccionBase, setTituloSeccionBase] = useState<string>('Promociones')

  // Cargar productos dinámicos, plan y título basados en configuración
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [products, plan, tituloBase] = await Promise.all([
          getProductosHomeDinamicos(),
          getPlanHomeDinamico(),
          getTituloSeccionPromos()
        ])

        setPromoProducts(products)
        setPlanInfo(plan)
        setTituloSeccionBase(tituloBase)
      } catch (err) {
        setError('Error al cargar los productos promocionales')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <section className="py-20 text-white" style={{ background: 'linear-gradient(135deg, #003d5c, #005a8d, #003d5c)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-blue-100">Cargando productos promocionales...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 text-white" style={{ background: 'linear-gradient(135deg, #003d5c, #005a8d, #003d5c)' }}>
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
      id="promo-productos"
      className="pt-8 pb-20 text-white relative"
      style={{ background: 'linear-gradient(135deg, #003d5c, #005a8d, #003d5c)' }}
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl animate-float delay-200"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
            {tituloSeccionBase}
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {planInfo
              ? planInfo.cuotas === 1
                ? 'Los mejores productos disponibles en oferta de contado'
                : `Los mejores productos disponibles en ${planInfo.cuotas} cuotas`
              : `Los mejores productos de ${tituloSeccionBase.toLowerCase()}`
            }
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mt-4 rounded-full animate-pulse-glow"></div>
        </div>

        {/* Contador de productos */}
        <div className="mb-8 text-center mt-4">
          <p className="text-blue-100">
            <span className="font-semibold text-white">{promoProducts.length}</span> productos {planInfo ? (planInfo.cuotas === 1 ? 'en oferta de contado' : `en ${planInfo.cuotas} cuotas`) : 'promocionales'}
          </p>
        </div>

        {promoProducts.length === 0 ? (
          <div className="text-center">
            <p className="text-xl text-blue-100">No hay productos disponibles {planInfo ? (planInfo.cuotas === 1 ? 'en oferta de contado' : `en ${planInfo.cuotas} cuotas`) : 'promocionales'}</p>
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
                {promoProducts.map((product) => (
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