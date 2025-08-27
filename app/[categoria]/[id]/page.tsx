import { Metadata } from "next"
import { getProductById } from "@/lib/supabase-products"
import { getCategories } from "@/lib/supabase-products"
import ProductPageClient from "./ProductPageClient"

interface ProductoPageProps {
  params: Promise<{
    categoria: string
    id: string
  }>
}

// Función para generar metadatos dinámicos
export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const resolvedParams = await params
  
  try {
    // Obtener el producto
    const product = await getProductById(resolvedParams.id)
    
    if (!product) {
      return {
        title: "Producto no encontrado - MUNDOCUOTAS",
        description: "El producto que buscas no está disponible.",
      }
    }

    // Obtener categorías para encontrar la categoría correcta
    const categories = await getCategories()
    const categoria = categories.find(cat => {
      const slug = cat.descripcion?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      return slug === resolvedParams.categoria
    })

    // Verificar que el producto pertenece a la categoría correcta
    if (product.fk_id_categoria !== categoria?.id) {
      return {
        title: "Producto no encontrado - MUNDOCUOTAS",
        description: "El producto que buscas no está disponible en esta categoría.",
      }
    }

    // Obtener la primera imagen del producto
    const productImage = product.imagen || product.imagen_2 || product.imagen_3 || product.imagen_4 || product.imagen_5 || '/placeholder.jpg'
    
    // Construir la URL completa de la imagen
    const imageUrl = productImage.startsWith('http') ? productImage : `https://catalogo-mundocuotas.vercel.app${productImage}`

    const title = `${product.descripcion} - ${categoria?.descripcion || 'Producto'} | MUNDOCUOTAS`
    const description = product.descripcion_detallada 
      ? product.descripcion_detallada.substring(0, 160) + '...'
      : `Descubre ${product.descripcion} con los mejores planes de financiación. ${categoria?.descripcion || 'Producto'} de calidad.`

    return {
      title,
      description,
      keywords: `${product.descripcion}, ${categoria?.descripcion}, ${product.marca?.descripcion}, electrodomésticos, cuotas, financiación`,
      openGraph: {
        type: 'website',
        locale: 'es_AR',
        url: `https://catalogo-mundocuotas.vercel.app/${resolvedParams.categoria}/${resolvedParams.id}`,
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

export default async function ProductoPage({ params }: ProductoPageProps) {
  return <ProductPageClient params={params} />
}
