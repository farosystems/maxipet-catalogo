import { Metadata } from "next"
import { getComboById, getComboByIdForMetadata } from "@/lib/supabase-products"
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
    // Obtener el combo (sin filtrar por activo para metadatos)
    const combo = await getComboByIdForMetadata(resolvedParams.id)

    console.log(`🔍 [Combo ${resolvedParams.id}] Datos obtenidos:`, combo)

    if (!combo) {
      console.log(`❌ [Combo ${resolvedParams.id}] No encontrado`)
      return {
        title: "Combo no encontrado - MUNDOCUOTA",
        description: "El combo que buscas no está disponible.",
      }
    }

    // Obtener la primera imagen del combo
    const comboImage = combo.imagen || combo.imagen_2 || combo.imagen_3 || combo.imagen_4 || combo.imagen_5 || '/placeholder.jpg'

    console.log(`🖼️ [Combo ${resolvedParams.id}] Imagen seleccionada:`, comboImage)

    // Construir la URL completa de la imagen
    let imageUrl: string

    if (comboImage.startsWith('http://') || comboImage.startsWith('https://')) {
      // URL absoluta
      imageUrl = comboImage
    } else if (comboImage.startsWith('/')) {
      // URL relativa que empieza con /
      imageUrl = `https://catalogo-mundocuotas.vercel.app${comboImage}`
    } else {
      // URL relativa sin /
      imageUrl = `https://catalogo-mundocuotas.vercel.app/${comboImage}`
    }

    // Forzar actualización de metadatos con parámetro único
    if (imageUrl.includes('supabase.co')) {
      imageUrl += `?t=combo-${resolvedParams.id}-v2`
    }

    console.log(`🌐 [Combo ${resolvedParams.id}] URL imagen final:`, imageUrl)

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
        siteName: 'MUNDOCUOTA',
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
      title: "Combo - MUNDOCUOTA",
      description: "Descubre nuestros combos especiales con los mejores descuentos.",
    }
  }
}

export default async function ComboPage({ params }: ComboPageProps) {
  return <ComboPageClient params={params} />
}