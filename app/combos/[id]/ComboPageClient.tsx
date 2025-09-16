"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import GlobalAppBar from "@/components/GlobalAppBar"
import Footer from "@/components/Footer"
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton"
import ProductImageGallery from "@/components/ProductImageGallery"
import FormattedProductDescription from "@/components/FormattedProductDescription"
import AddToListButton from "@/components/AddToListButton"
import ComboProductsSection from "@/components/ComboProductsSection"
import FinancingPlansCombo from "@/components/FinancingPlansCombo"
import { getComboById, isComboValid, getCombosVigentes } from "@/lib/supabase-products"
import { Combo } from "@/lib/products"
import { ArrowLeft, Clock, Package, Tag, Calendar } from "lucide-react"

interface ComboPageClientProps {
  params: Promise<{
    id: string
  }>
}

export default function ComboPageClient({ params: paramsPromise }: ComboPageClientProps) {
  const [combo, setCombo] = useState<Combo | null>(null)
  const [relatedCombos, setRelatedCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState<{ id: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await paramsPromise
      setParams(resolvedParams)
    }
    resolveParams()
  }, [paramsPromise])

  useEffect(() => {
    if (!params) return

    const loadCombo = async () => {
      try {
        setLoading(true)

        const [comboData, otherCombos] = await Promise.all([
          getComboById(params.id),
          getCombosVigentes()
        ])

        if (!comboData) {
          notFound()
          return
        }

        setCombo(comboData)

        // Filtrar otros combos (excluir el actual)
        const filteredCombos = otherCombos.filter(c => c.id !== comboData.id).slice(0, 3)
        setRelatedCombos(filteredCombos)
      } catch (error) {
        console.error('Error loading combo:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    loadCombo()
  }, [params])

  const handleBackToHome = () => {
    router.push('/#combos')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando combo...</p>
        </div>
      </div>
    )
  }

  if (!combo) {
    notFound()
    return null
  }

  const isValid = isComboValid(combo)
  const hasDiscount = combo.descuento_porcentaje > 0
  const comboDescription = combo.descripcion && combo.descripcion.trim() !== ''
    ? combo.descripcion
    : `<h3>Combo Especial ${combo.nombre}</h3>
       <p>Este combo incluye ${combo.productos?.length || 0} productos seleccionados especialmente para ti.</p>
       ${combo.descuento_porcentaje > 0 ? `<p><strong>¡Ahorrás un ${combo.descuento_porcentaje}% comprando todo junto!</strong></p>` : ''}
       <p>Precio final del combo: <strong>$${combo.precio_combo.toLocaleString()}</strong></p>
       ${hasDiscount ? `<p>Precio original: <strike>$${combo.precio_original.toLocaleString()}</strike> - Ahorro: <strong style="color: green;">$${(combo.precio_original - combo.precio_combo).toLocaleString()}</strong></p>` : ''}`

  // Convertir combo a formato de producto para componentes existentes
  const comboAsProduct = {
    id: combo.id.toString(),
    descripcion: combo.nombre,
    descripcion_detallada: comboDescription,
    precio: combo.precio_combo,
    imagen: combo.imagen || '/placeholder.jpg',
    imagen_2: combo.imagen_2,
    imagen_3: combo.imagen_3,
    imagen_4: combo.imagen_4,
    imagen_5: combo.imagen_5,
    fk_id_categoria: combo.fk_id_categoria || 1,
    fk_id_marca: 1,
    destacado: false,
    tiene_stock: combo.activo && isValid, // Esto habilitará el botón de favoritos
    stock: combo.activo && isValid ? 1 : 0,
    categoria: {
      id: combo.fk_id_categoria || 1,
      descripcion: 'combos' // Esto generará URL /combos/[id]
    },
    // Indicador para el componente ProductImageGallery de que es un combo
    isCombo: true
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalAppBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4 sm:mb-8">
          <button
            onClick={handleBackToHome}
            className="hover:text-violet-600 transition-colors"
          >
            Inicio
          </button>
          <span>/</span>
          <button
            onClick={handleBackToHome}
            className="hover:text-violet-600 transition-colors"
          >
            Combos
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{combo.nombre}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galería de imágenes */}
          <div>
            <ProductImageGallery
              images={combo.imagenes}
              productName={combo.nombre}
              isFeatured={false}
              product={comboAsProduct}
            />

            {/* Título móvil - debajo de la imagen */}
            <div className="lg:hidden mt-6">
              {/* Estado del combo */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  <Package className="w-4 h-4 mr-1" />
                  COMBO ESPECIAL
                </span>
                {!isValid && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    <Clock className="w-4 h-4 mr-1" />
                    No vigente
                  </span>
                )}
                {hasDiscount && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <Tag className="w-3 h-3 mr-1" />
                    -{combo.descuento_porcentaje}%
                  </span>
                )}
              </div>

              {/* Título */}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                {combo.nombre}
              </h1>


              {/* Planes de Financiación móvil */}
              {isValid && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Opciones de Financiación</h3>
                  <FinancingPlansCombo
                    comboId={combo.id.toString()}
                    precio={combo.precio_combo}
                    showDebug={false}
                  />
                </div>
              )}

              {/* Vigencia móvil */}
              {combo.fecha_vigencia_fin && (
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <Calendar className="w-5 h-5" />
                  <span>
                    Válido hasta: {new Date(combo.fecha_vigencia_fin).toLocaleDateString('es-AR')}
                  </span>
                </div>
              )}

              {/* Botón agregar a lista móvil */}
              {isValid && (
                <div className="mb-6">
                  <AddToListButton product={comboAsProduct} variant="page" />
                </div>
              )}
            </div>
          </div>

          {/* Información del combo - solo desktop */}
          <div className="hidden lg:block space-y-6">
            {/* Estado del combo */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                <Package className="w-4 h-4 mr-1" />
                COMBO ESPECIAL
              </span>
              {!isValid && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <Clock className="w-4 h-4 mr-1" />
                  No vigente
                </span>
              )}
            </div>

            {/* Título */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              {combo.nombre}
            </h1>


            {/* Planes de Financiación */}
            {isValid && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Opciones de Financiación</h3>
                <FinancingPlansCombo
                  comboId={combo.id.toString()}
                  precio={combo.precio_combo}
                  showDebug={false}
                />
              </div>
            )}

            {/* Vigencia */}
            {combo.fecha_vigencia_fin && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>
                  Válido hasta: {new Date(combo.fecha_vigencia_fin).toLocaleDateString('es-AR')}
                </span>
              </div>
            )}

            {/* Botón agregar a lista */}
            {isValid && (
              <div className="space-y-4">
                <AddToListButton product={comboAsProduct} variant="page" />
              </div>
            )}

            {/* Información adicional - solo desktop */}
            <div className="border-t pt-6 space-y-4">
              <div className="text-sm">
                <div>
                  <span className="font-medium text-gray-900">Productos incluidos:</span>
                  <span className="text-gray-600 ml-1">{combo.productos?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional móvil */}
        <div className="lg:hidden bg-white rounded-lg p-4 shadow-sm mb-8">
          <div className="text-sm">
            <div>
              <span className="font-medium text-gray-900">Productos incluidos:</span>
              <span className="text-gray-600 ml-1">{combo.productos?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Descripción del Combo */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Descripción del Combo</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm max-w-4xl mx-auto">
            <FormattedProductDescription description={comboDescription} />
          </div>
        </div>

        {/* Productos que forman el combo */}
        {combo.productos && combo.productos.length > 0 && (
          <ComboProductsSection productos={combo.productos} />
        )}

        {/* Combos relacionados */}
        {relatedCombos.length > 0 && (
          <div className="mt-16 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4">
                Otros Combos Especiales
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                Descubre más combos con descuentos increíbles
              </p>
            </div>

            {/* Carrusel para móviles */}
            <div className="md:hidden">
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4 px-4">
                  {relatedCombos.map((relatedCombo) => (
                    <div
                      key={relatedCombo.id}
                      className="flex-shrink-0 w-64"
                    >
                      {/* Usar ComboCard aquí cuando esté disponible */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold">{relatedCombo.nombre}</h3>
                        <p className="text-violet-600 font-bold">
                          ${relatedCombo.precio_combo.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid para desktop */}
            <div className="hidden md:block">
              <div className="grid grid-cols-3 gap-8">
                {relatedCombos.slice(0, 3).map((relatedCombo) => (
                  <div key={relatedCombo.id} className="animate-fade-in-up">
                    {/* Usar ComboCard aquí cuando esté disponible */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold">{relatedCombo.nombre}</h3>
                      <p className="text-violet-600 font-bold">
                        ${relatedCombo.precio_combo.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón ver más */}
            <div className="text-center mt-8">
              <button
                onClick={handleBackToHome}
                className="inline-flex items-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Ver más combos
                <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppFloatingButton product={comboAsProduct} />
    </div>
  )
}