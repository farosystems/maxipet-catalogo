"use client"

import { useEffect, useState, useRef } from "react"
import ProductCard from "./ProductCard"
import Pagination from "./Pagination"
import { getProductosHomeDinamicos, getPlanHomeDinamico } from "@/lib/supabase-products"
import { getTituloSeccionPromos } from "@/lib/supabase-config"
import { PlanFinanciacion } from "@/lib/products"
import { Product } from "@/lib/products"

const PROMO_PRODUCTS_PER_PAGE = 3

export default function Promo12CuotasSection() {
  const [promoProducts, setPromoProducts] = useState<Product[]>([])
  const [planInfo, setPlanInfo] = useState<PlanFinanciacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [tituloSeccionBase, setTituloSeccionBase] = useState<string>('Promociones')
  const scrollRef = useRef<HTMLDivElement>(null)

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
      <section className="py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-violet-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-violet-100">Cargando productos promocionales...</p>
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
            <p className="text-xl text-red-300">Error al cargar los productos: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  // Calcular paginación para productos de 12 cuotas
  const totalPages = Math.ceil(promoProducts.length / PROMO_PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PROMO_PRODUCTS_PER_PAGE
  const displayProducts = promoProducts.slice(startIndex, startIndex + PROMO_PRODUCTS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll suave a la sección de promo
    document.getElementById("promo-productos")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="promo-productos"
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
            {tituloSeccionBase}
          </h2>
          <p className="text-xl text-violet-100 max-w-2xl mx-auto">
            {planInfo 
              ? `Los mejores productos disponibles en ${planInfo.cuotas} cuotas`
              : `Los mejores productos de ${tituloSeccionBase.toLowerCase()}`
            }
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mt-4 rounded-full animate-pulse-glow"></div>
        </div>

        {/* Contador de productos */}
        <div className="mb-8 text-center">
          <p className="text-violet-100">
            <span className="md:hidden">
              <span className="font-semibold text-white">{promoProducts.length}</span> productos {planInfo ? `en ${planInfo.cuotas} cuotas` : 'promocionales'}
            </span>
            <span className="hidden md:inline">
              Mostrando <span className="font-semibold text-white">{displayProducts.length}</span> de{" "}
              <span className="font-semibold text-white">{promoProducts.length}</span> productos {planInfo ? `en ${planInfo.cuotas} cuotas` : 'promocionales'}
            </span>
          </p>
        </div>

        {promoProducts.length === 0 ? (
          <div className="text-center">
            <p className="text-xl text-violet-100">No hay productos disponibles {planInfo ? `en ${planInfo.cuotas} cuotas` : 'promocionales'}</p>
          </div>
        ) : (
          <>
            {/* Carrusel para móviles */}
            <div className="md:hidden">
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4 px-4">
                  {promoProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-64"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid para desktop */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                {displayProducts.map((product, index) => (
                  <div
                    key={`${product.id}-${currentPage}`}
                    className={`transition-all duration-700 ${
                      index === 0
                        ? "delay-100 animate-fade-in-up"
                        : index === 1
                          ? "delay-200 animate-fade-in-up"
                          : "delay-300 animate-fade-in-up"
                    }`}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Paginación para desktop */}
              {promoProducts.length > PROMO_PRODUCTS_PER_PAGE && (
                <div className="mt-12">
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}