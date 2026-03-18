'use client'

import { useMemo, use } from 'react'
import { ArrowLeft, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import GlobalAppBar from '@/components/GlobalAppBar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { useProducts } from '@/hooks/use-products'

interface MarcaCategoryClientProps {
  params: Promise<{
    id: string
  }>
}

export default function MarcaCategoryClient({ params }: MarcaCategoryClientProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { products, brands, loading: productsLoading } = useProducts()

  const marcaId = parseInt(resolvedParams.id)

  // Memoizar la búsqueda de marca
  const marcaNombre = useMemo(() => {
    const marca = brands.find(b => b.id === marcaId)
    return marca?.descripcion || ''
  }, [brands, marcaId])

  // Memoizar el filtrado para evitar recálculos
  const filteredProducts = useMemo(() => {
    return products.filter(product => product.fk_id_marca === marcaId)
  }, [products, marcaId])

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <GlobalAppBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ marginTop: '25px' }}>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </button>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {marcaNombre || 'Productos por Marca'}
          </h1>
          <p className="text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </p>
        </div>

        {productsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package size={64} className="text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No hay productos disponibles
            </h2>
            <p className="text-gray-600 mb-6">
              No se encontraron productos de esta marca
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="animate-fade-in-up">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
