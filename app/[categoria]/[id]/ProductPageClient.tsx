"use client"

import { useState, useEffect, useMemo } from "react"
import { use } from "react"
import { ArrowLeft, Package, CheckCircle, Star, Truck, Shield, CreditCard, Users, Tag } from "lucide-react"
import { useRouter } from "next/navigation"
import GlobalAppBar from "@/components/GlobalAppBar"
import Footer from "@/components/Footer"
import ProductImageGallery from "@/components/ProductImageGallery"
import FinancingPlansLarge from "@/components/FinancingPlansLarge"
import ProductCard from "@/components/ProductCard"
import AddToListButton from "@/components/AddToListButton"
import FormattedProductDescription from "@/components/FormattedProductDescription"
import WhatsAppButton from "@/components/WhatsAppButton"
import { useProducts } from "@/hooks/use-products"
import { getProductById, formatearPrecio, isOfertaVigente } from "@/lib/supabase-products"

interface ProductPageClientProps {
  params: Promise<{
    categoria: string
    id: string
  }>
}

export default function ProductPageClient({ params }: ProductPageClientProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { products, categories } = useProducts()

  // Encontrar la categoría por slug
  const categoria = categories.find(cat => {
    const slug = cat.descripcion?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    return slug === resolvedParams.categoria
  })

  // Productos relacionados de la misma categoría
  const relatedProducts = useMemo(() => {
    if (!product || !categoria) return []
    
    return products
      .filter(p => p.fk_id_categoria === categoria.id && p.id !== product.id)
      .slice(0, 6) // Mostrar máximo 6 productos relacionados
  }, [products, product, categoria])

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const productData = await getProductById(resolvedParams.id)
        
        if (!productData) {
          setError('Producto no encontrado')
          return
        }

        // Verificar que el producto pertenece a la categoría correcta
        if (productData.fk_id_categoria !== categoria?.id) {
          setError('El producto no pertenece a esta categoría')
          return
        }

        setProduct(productData)
      } catch (err) {
        setError('Error al cargar el producto')
        console.error('Error loading product:', err)
      } finally {
        setLoading(false)
      }
    }

    if (categoria) {
      loadProduct()
    }
  }, [resolvedParams.id, categoria])

  const handleBackToCategory = () => {
    router.push(`/${resolvedParams.categoria}`)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '140px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900">Cargando producto...</h2>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '140px' }}>
          <div className="text-center">
            <Package size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h2>
            <p className="text-xl text-gray-600 mb-6">{error || 'El producto no existe'}</p>
            <button
              onClick={handleBackToCategory}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Volver a {categoria?.descripcion}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const productDescription = product.descripcion_detallada || product.description || 'Sin descripción disponible'

  // Verificar si tiene oferta individual vigente
  const hasOferta = isOfertaVigente(product)
  const precioOferta = hasOferta ? product.precio_oferta! : product.precio
  const descuentoOferta = hasOferta ? product.descuento_porcentual! : 0

  // Verificar si tiene promoción con descuento válido
  const hasPromo = !!product.promo && !!product.precio_con_descuento && product.promo.descuento_porcentaje > 0

  // Determinar precio final: priorizar oferta individual sobre promoción
  const finalPrice = hasOferta ? precioOferta : (hasPromo ? product.precio_con_descuento! : (product.precio || 0))
  const hasDiscount = hasOferta || hasPromo
  const discountPercentage = hasOferta ? descuentoOferta : (hasPromo ? product.promo!.descuento_porcentaje : 0)
  const discountLabel = hasOferta ? 'Oferta Especial' : (hasPromo ? product.promo!.nombre : '')

  // Debug: Log para verificar las imágenes del producto
  //console.log('🔍 Producto completo:', product)
  //console.log('🔍 product.imagenes:', product.imagenes)
  //console.log('🔍 product.imagen:', product.imagen)
  //console.log('🔍 Array de imágenes que se pasa al componente:', product.imagenes || [product.imagen] || [])

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <GlobalAppBar />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-4" style={{ marginTop: '25px' }}>
        {/* Producto Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          {/* Galería de imágenes */}
          <div>
            {/* Fila con Breadcrumb y Badge Destacado */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={handleBackToCategory}
                className="inline-flex items-center text-emerald-600 hover:text-violet-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a {categoria?.descripcion}
              </button>
              
              {/* Badge Destacado */}
              {product.destacado && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                  <Star className="mr-2" size={14} />
                  Destacado
                </div>
              )}
            </div>
            
            <ProductImageGallery 
              images={product.imagenes || [product.imagen] || []}
              productName={product.descripcion || 'Producto'}
              isFeatured={product.destacado || false}
              brand={product.marca}
              product={product}
            />
            
            {/* Título móvil - debajo de la imagen */}
            <div className="lg:hidden mt-6">
              {/* Categoría y Marca */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full uppercase">
                  {categoria?.descripcion}
                </span>
                {product.marca && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full uppercase">
                    {product.marca.descripcion}
                  </span>
                )}
              </div>
              
              {/* Logo de la marca - móvil */}
              {product.marca?.logo && (
                <div className="mb-4 flex justify-start">
                  <img
                    src={product.marca.logo}
                    alt={`Logo ${product.marca.descripcion}`}
                    className="h-12 w-auto max-w-32 object-contain"
                  />
                </div>
              )}
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 uppercase">
                {product.descripcion}
              </h1>

              {/* Precio móvil - Siempre visible */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-0 shadow-md border border-blue-200">
                {hasOferta && hasPromo ? (
                  // Tiene AMBOS: oferta individual Y promoción
                  <>
                    {/* Precio de oferta */}
                    <div className="mb-3 pb-3 border-b border-blue-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-bold text-red-600 uppercase">
                          Oferta Especial
                        </span>
                        <span className="ml-auto bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                          -{descuentoOferta}% OFF
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-lg font-bold text-red-600 line-through decoration-2">
                          ${formatearPrecio(product.precio || 0)}
                        </span>
                        <span className="text-4xl font-bold text-green-600">
                          ${formatearPrecio(precioOferta)}
                        </span>
                      </div>
                    </div>

                    {/* Precio de promoción */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-bold text-orange-600 uppercase">
                          {product.promo!.nombre}
                        </span>
                        <span className="ml-auto bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                          -{product.promo!.descuento_porcentaje}% OFF
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-base font-bold text-orange-600 line-through decoration-2">
                          ${formatearPrecio(product.precio || 0)}
                        </span>
                        <span className="text-3xl font-bold text-blue-600">
                          ${formatearPrecio(product.precio_con_descuento!)}
                        </span>
                      </div>
                      {product.promo!.descripcion && (
                        <p className="text-xs text-gray-700 mt-2 bg-white/50 rounded p-2">{product.promo!.descripcion}</p>
                      )}
                    </div>
                  </>
                ) : hasDiscount ? (
                  // Solo oferta O solo promoción
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold text-red-600 uppercase">
                        {discountLabel}
                      </span>
                      <span className="ml-auto bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                        -{discountPercentage}% OFF
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-lg font-bold text-red-600 line-through decoration-2">
                        ${formatearPrecio(product.precio || 0)}
                      </span>
                      <span className="text-4xl font-bold text-green-600">
                        ${formatearPrecio(finalPrice)}
                      </span>
                    </div>
                    {hasPromo && product.promo!.descripcion && (
                      <p className="text-xs text-gray-700 mt-2 bg-white/50 rounded p-2">{product.promo!.descripcion}</p>
                    )}
                  </>
                ) : (
                  // Sin oferta ni promoción
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-700">Precio:</span>
                    <span className="text-4xl font-bold text-blue-600">
                      ${formatearPrecio(product.precio || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información del producto */}
          <div>
            {/* Categoría y Marca - solo desktop */}
            <div className="hidden lg:flex flex-wrap gap-2 mb-4">
              <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full uppercase">
                {categoria?.descripcion}
              </span>
              {product.marca && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full uppercase">
                  {product.marca.descripcion}
                </span>
              )}
            </div>
            
            {/* Logo de la marca - desktop */}
            {product.marca?.logo && (
              <div className="hidden lg:flex justify-start mb-1">
                <img
                  src={product.marca.logo}
                  alt={`Logo ${product.marca.descripcion}`}
                  className="h-16 w-auto max-w-48 object-contain"
                />
              </div>
            )}
            
            <h1 className="hidden lg:block text-3xl font-bold text-gray-900 mb-4 uppercase">
              {product.descripcion}
            </h1>

            {/* Precio del producto - Siempre visible */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-4 shadow-md border border-blue-200">
              {hasOferta && hasPromo ? (
                // Tiene AMBOS: oferta individual Y promoción
                <>
                  {/* Precio de oferta */}
                  <div className="mb-4 pb-4 border-b border-blue-300">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-bold text-red-600 uppercase">
                        Oferta Especial
                      </span>
                      <span className="ml-auto bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        -{descuentoOferta}% OFF
                      </span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-2xl font-bold text-red-600 line-through decoration-4">
                        ${formatearPrecio(product.precio || 0)}
                      </span>
                      <span className="text-5xl font-bold text-green-600">
                        ${formatearPrecio(precioOferta)}
                      </span>
                    </div>
                  </div>

                  {/* Precio de promoción */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-bold text-orange-600 uppercase">
                        {product.promo!.nombre}
                      </span>
                      <span className="ml-auto bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        -{product.promo!.descuento_porcentaje}% OFF
                      </span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-xl font-bold text-orange-600 line-through decoration-4">
                        ${formatearPrecio(product.precio || 0)}
                      </span>
                      <span className="text-4xl font-bold text-blue-600">
                        ${formatearPrecio(product.precio_con_descuento!)}
                      </span>
                    </div>
                    {product.promo!.descripcion && (
                      <p className="text-sm text-gray-700 mt-3 bg-white/50 rounded p-2">{product.promo!.descripcion}</p>
                    )}
                  </div>
                </>
              ) : hasDiscount ? (
                // Solo oferta O solo promoción
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-bold text-red-600 uppercase">
                      {discountLabel}
                    </span>
                    <span className="ml-auto bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      -{discountPercentage}% OFF
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-2xl font-bold text-red-600 line-through decoration-4">
                      ${formatearPrecio(product.precio || 0)}
                    </span>
                    <span className="text-5xl font-bold text-green-600">
                      ${formatearPrecio(finalPrice)}
                    </span>
                  </div>
                  {hasPromo && product.promo!.descripcion && (
                    <p className="text-sm text-gray-700 mt-3 bg-white/50 rounded p-2">{product.promo!.descripcion}</p>
                  )}
                </>
              ) : (
                // Sin oferta ni promoción
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-blue-700">Precio:</span>
                  <span className="text-5xl font-bold text-blue-600">
                    ${formatearPrecio(product.precio || 0)}
                  </span>
                </div>
              )}
            </div>

            {/* Precios */}
            <div className="mb-4 -mt-2 lg:mt-0">
              <FinancingPlansLarge
                productoId={product.id.toString()}
                precio={hasOferta ? precioOferta : product.precio}
                hasStock={product.tiene_stock}
              />
            </div>

            {/* Botones de acción */}
            <div className="mb-8 space-y-3">
              <AddToListButton product={product} variant="page" />
              <WhatsAppButton product={product} />
            </div>

            {/* Características adicionales */}
            {product.caracteristicas && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Características</h2>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.caracteristicas}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Descripción del Producto (sección separada) */}
        <div className="mb-0 sm:mb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-6 text-center">Descripción del Producto</h2>
          <div className="bg-white rounded-lg p-3 sm:p-8 shadow-sm max-w-4xl mx-auto">
            <FormattedProductDescription description={productDescription} />
          </div>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mb-16 mt-12">
            <div className="text-center mb-12">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4">
                Productos que te pueden interesar
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                Descubre más productos de la misma categoría que podrían ser perfectos para ti
              </p>
            </div>

            {/* Carrusel para móviles */}
            <div className="md:hidden">
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4 px-4">
                  {relatedProducts.map((relatedProduct) => (
                    <div
                      key={relatedProduct.id}
                      className="flex-shrink-0 w-64"
                    >
                      <ProductCard product={relatedProduct} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid para desktop */}
            <div className="hidden md:block">
              <div className="grid grid-cols-3 gap-8">
                {relatedProducts.slice(0, 3).map((relatedProduct) => (
                  <div key={relatedProduct.id} className="animate-fade-in-up">
                    <ProductCard product={relatedProduct} />
                  </div>
                ))}
              </div>
            </div>

            {/* Botón ver más */}
            <div className="text-center mt-8">
              <button
                onClick={handleBackToCategory}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Ver más productos
                <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* Sección "Por qué elegirnos" */}
        <div className="mb-4 bg-gray-50 py-2 sm:py-8">
          <div className="text-center mb-3 sm:mb-12">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              ¿Por qué elegir SUR IMPORTACIÓN?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto">
            {/* Envío gratis */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Envío Gratis</h3>
            </div>

            {/* Garantía oficial */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Garantía Oficial</h3>
            </div>

            {/* Financiación flexible */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Financiación Flexible</h3>
            </div>

            {/* Atención personalizada */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Atención Personalizada</h3>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
