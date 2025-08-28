"use client"

import { useState, useEffect, useMemo } from "react"
import { use } from "react"
import { ArrowLeft, Package, CheckCircle, Star, Truck, Shield, CreditCard, Headphones } from "lucide-react"
import { useRouter } from "next/navigation"
import GlobalAppBar from "@/components/GlobalAppBar"
import Footer from "@/components/Footer"
import ProductImageGallery from "@/components/ProductImageGallery"
import FinancingPlansLarge from "@/components/FinancingPlansLarge"
import ProductCard from "@/components/ProductCard"
import WhatsAppButton from "@/components/WhatsAppButton"
import AddToListButton from "@/components/AddToListButton"
import FormattedProductDescription from "@/components/FormattedProductDescription"
import { useProducts } from "@/hooks/use-products"
import { getProductById } from "@/lib/supabase-products"

interface ProductVariosPageClientProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductVariosPageClient({ params }: ProductVariosPageClientProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { products } = useProducts()

  // Productos relacionados (sin filtro de categoría)
  const relatedProducts = useMemo(() => {
    if (!product) return []
    
    return products
      .filter(p => p.id !== product.id)
      .slice(0, 6) // Mostrar máximo 6 productos relacionados
  }, [products, product])

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Cargando producto con ID:', resolvedParams.id)
        const productData = await getProductById(resolvedParams.id)
        
        console.log('🔍 Producto cargado:', productData)
        
        if (!productData) {
          setError('Producto no encontrado')
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

    loadProduct()
  }, [resolvedParams.id])

  const handleBackToHome = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '140px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600 mx-auto mb-4"></div>
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
              onClick={handleBackToHome}
              className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const productDescription = product.descripcion_detallada || product.description || 'Sin descripción disponible'

  // Debug: Log para verificar las imágenes del producto
  console.log('🔍 Producto completo:', product)
  console.log('🔍 product.imagenes:', product.imagenes)
  console.log('🔍 product.imagen:', product.imagen)
  console.log('🔍 Array de imágenes que se pasa al componente:', product.imagenes || [product.imagen] || [])

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <GlobalAppBar />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-4" style={{ marginTop: '30px' }}>
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center text-violet-600 hover:text-violet-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </button>
        </div>

        {/* Producto Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Galería de imágenes */}
          <div>
            <ProductImageGallery 
              images={product.imagenes || [product.imagen] || []}
              productName={product.descripcion || 'Producto'}
              isFeatured={product.destacado || false}
              brand={product.marca}
            />
          </div>

          {/* Información del producto */}
          <div>
            {/* Categoría y Marca */}
            <div className="flex gap-2 mb-4">
              {product.categoria && (
                <span className="text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full uppercase">
                  {product.categoria.descripcion}
                </span>
              )}
              {product.marca && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full uppercase">
                  {product.marca.descripcion}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4 uppercase">
              {product.descripcion}
            </h1>

            {/* Precios */}
            <div className="mb-8">
              <FinancingPlansLarge 
                productoId={product.id.toString()}
                precio={product.precio || 0}
              />
            </div>

            {/* Botones de acción */}
            <div className="mb-8 space-y-4">
              <WhatsAppButton product={product} />
              <AddToListButton product={product} variant="page" />
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
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Descripción del Producto</h2>
          <div className="bg-white rounded-lg p-8 shadow-sm max-w-4xl mx-auto">
            <FormattedProductDescription description={productDescription} />
          </div>
        </div>

        {/* Sección "Por qué elegirnos" */}
        <div className="mb-16 bg-gray-50 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir MUNDOCUOTAS?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Envío gratis */}
            <div className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Envío Gratis</h3>
              <p className="text-gray-600">
                Entrega a domicilio sin cargo adicional en toda la ciudad
              </p>
            </div>

            {/* Garantía oficial */}
            <div className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Garantía Oficial</h3>
              <p className="text-gray-600">
                Todos nuestros productos incluyen garantía de fábrica
              </p>
            </div>

            {/* Financiación flexible */}
            <div className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Financiación Flexible</h3>
              <p className="text-gray-600">
                Planes de pago adaptados a tu presupuesto
              </p>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Productos que te pueden interesar
              </h2>
              <p className="text-lg text-gray-600">
                Descubre más productos que podrían ser perfectos para ti
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.slice(0, 3).map((relatedProduct) => (
                <div key={relatedProduct.id} className="animate-fade-in-up">
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>

            {/* Botón ver más */}
            <div className="text-center mt-8">
              <button
                onClick={handleBackToHome}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Ver más productos
                <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
