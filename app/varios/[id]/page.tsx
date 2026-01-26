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
        title: "Producto no encontrado - MaxiPet",
        description: "El producto que buscas no está disponible.",
      }
    }

    // Obtener la primera imagen del producto
    const productImage = product.imagen || product.imagen_2 || product.imagen_3 || product.imagen_4 || product.imagen_5 || '/placeholder.jpg'

    // Construir la URL completa de la imagen
    let imageUrl: string

    if (productImage.startsWith('http://') || productImage.startsWith('https://')) {
      // URL absoluta - usar proxy para Supabase (WhatsApp no acepta Supabase directo)
      if (productImage.includes('supabase.co')) {
        // Supabase SIEMPRE con proxy + timestamp
        const proxiedUrl = `https://www.mundocuota.com.ar/api/image-proxy?url=${encodeURIComponent(productImage)}`
        imageUrl = `${proxiedUrl}&t=${Date.now()}`
      } else {
        // URLs externas como mlstatic funcionan directamente
        imageUrl = productImage.includes('?')
          ? `${productImage}&v=${Date.now()}`
          : `${productImage}?v=${Date.now()}`
      }
    } else if (productImage.startsWith('/')) {
      // URL relativa que empieza con /
      imageUrl = `https://www.mundocuota.com.ar${productImage}?v=${Date.now()}`
    } else {
      // URL relativa sin /
      imageUrl = `https://www.mundocuota.com.ar/${productImage}?v=${Date.now()}`
    }

    const title = `${product.descripcion} | MaxiPet`
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
        url: `https://www.mundocuota.com.ar/varios/${resolvedParams.id}`,
        siteName: 'MaxiPet',
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
      title: "Producto - MaxiPet",
      description: "Descubre nuestros productos con los mejores planes de financiación.",
    }
  }
}

export default async function ProductoVariosPage({ params }: ProductoVariosPageProps) {
  return <ProductVariosPageClient params={params} />
}
