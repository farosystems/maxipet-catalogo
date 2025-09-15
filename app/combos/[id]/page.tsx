import { Metadata } from "next"
import { getComboById } from "@/lib/supabase-products"
import ComboPageClient from "./ComboPageClient"

interface ComboPageProps {
  params: Promise<{
    id: string
  }>
}

// Función para generar metadatos dinámicos
export async function generateMetadata({ params }: ComboPageProps): Promise<Metadata> {
  const resolvedParams = await params

  try {
    // Obtener el combo
    const combo = await getComboById(resolvedParams.id)

    if (!combo) {
      return {
        title: "Combo no encontrado - MUNDOCUOTAS",
        description: "El combo que buscas no está disponible.",
      }
    }

    // Obtener la primera imagen del combo
    const comboImage = combo.imagen || combo.imagen_2 || combo.imagen_3 || combo.imagen_4 || combo.imagen_5 || '/placeholder.jpg'

    // Construir la URL completa de la imagen
    const imageUrl = comboImage.startsWith('http') ? comboImage : `https://catalogo-mundocuotas.vercel.app${comboImage}`

    const title = `${combo.nombre} - Combo Especial | MUNDOCUOTAS`
    const description = combo.descripcion
      ? combo.descripcion.substring(0, 160) + '...'
      : `Aprovechá nuestro combo ${combo.nombre} con ${combo.descuento_porcentaje}% de descuento. ¡Ahorrá en grande!`

    return {
      title,
      description,
      keywords: `${combo.nombre}, combo, descuento, electrodomésticos, cuotas, financiación, oferta especial`,
      openGraph: {
        type: 'website',
        locale: 'es_AR',
        url: `https://catalogo-mundocuotas.vercel.app/combos/${resolvedParams.id}`,
        siteName: 'MUNDOCUOTAS',
        title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: combo.nombre,
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
      title: "Combo - MUNDOCUOTAS",
      description: "Descubre nuestros combos especiales con los mejores descuentos.",
    }
  }
}

export default async function ComboPage({ params }: ComboPageProps) {
  return <ComboPageClient params={params} />
}