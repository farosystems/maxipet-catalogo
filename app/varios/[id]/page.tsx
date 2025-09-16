import { Metadata } from "next"
import { getProductById } from "@/lib/supabase-products"
import ProductVariosPageClient from "./ProductVariosPageClient"

interface ProductoVariosPageProps {
  params: Promise<{
    id: string
  }>
}

// Función para generar metadatos dinámicos
export async function generateMetadata({ params }: ProductoVariosPageProps): Promise<Metadata> {
  const resolvedParams = await params
  
  try {
    // Obtener el producto
    const product = await getProductById(resolvedParams.id)
    
    if (!product) {
      return {
        title: "Producto no encontrado - MUNDOCUOTA",
        description: "El producto que buscas no está disponible.",
      }
    }

    // Obtener la primera imagen del producto
    const productImage = product.imagen || product.imagen_2 || product.imagen_3 || product.imagen_4 || product.imagen_5 || '/placeholder.jpg'
    
    // Construir la URL completa de la imagen
    const imageUrl = productImage.startsWith('http') ? productImage : `https://catalogo-mundocuotas.vercel.app${productImage}`

    const title = `${product.descripcion} | MUNDOCUOTAS`
    const description = product.descripcion_detallada 
      ? product.descripcion_detallada.substring(0, 160) + '...'
      : `Descubre ${product.descripcion} con los mejores planes de financiación. Producto de calidad.`

    return {
      title,
      description,
      keywords: `${product.descripcion}, ${product.categoria?.descripcion}, ${product.marca?.descripcion}, electrodomésticos, cuotas, financiación`,
      openGraph: {
        type: 'website',
        locale: 'es_AR',
        url: `https://catalogo-mundocuotas.vercel.app/varios/${resolvedParams.id}`,
        siteName: 'MUNDOCUOTAS',
        title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.descripcion,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: "Producto - MUNDOCUOTAS",
      description: "Descubre nuestros productos con los mejores planes de financiación.",
    }
  }
}

export default async function ProductoVariosPage({ params }: ProductoVariosPageProps) {
  return <ProductVariosPageClient params={params} />
}
