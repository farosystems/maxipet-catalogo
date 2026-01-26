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
        title: "Combo no encontrado - MaxiPet",
        description: "El combo que buscas no está disponible.",
      }
    }

    // Obtener imagen del combo
    const comboImage = combo.imagen || combo.imagen_2 || combo.imagen_3 || combo.imagen_4 || combo.imagen_5 || '/placeholder.jpg'

    let imageUrl: string

    if (comboImage && (comboImage.startsWith('http://') || comboImage.startsWith('https://'))) {
      // URL absoluta - usar proxy para Supabase (WhatsApp no acepta Supabase directo)
      if (comboImage.includes('supabase.co')) {
        // Supabase SIEMPRE con proxy + timestamp
        const proxiedUrl = `https://www.mundocuota.com.ar/api/image-proxy?url=${encodeURIComponent(comboImage)}`
        imageUrl = `${proxiedUrl}&t=${Date.now()}`
      } else {
        // URLs externas como mlstatic funcionan directamente
        imageUrl = comboImage.includes('?')
          ? `${comboImage}&v=${Date.now()}`
          : `${comboImage}?v=${Date.now()}`
      }
    } else if (comboImage && comboImage.startsWith('/')) {
      // URL relativa que empieza con /
      imageUrl = `https://www.mundocuota.com.ar${comboImage}?v=${Date.now()}`
    } else if (comboImage && comboImage !== '/placeholder.jpg') {
      // URL relativa sin /
      imageUrl = `https://www.mundocuota.com.ar/${comboImage}?v=${Date.now()}`
    } else {
      // Fallback al logo
      imageUrl = `https://www.mundocuota.com.ar/LOGO2.png?v=${Date.now()}`
    }

    console.log(`🌐 [Combo ${resolvedParams.id}] URL imagen final:`, imageUrl)

    const title = `${combo.nombre} - Combo Especial | MaxiPet`
    const description = combo.descripcion
      ? combo.descripcion.substring(0, 160) + '...'
      : `Aprovechá nuestro combo ${combo.nombre} con ${combo.descuento_porcentaje}% de descuento. ¡Ahorrá en grande!`

    return {
      title,
      description,
      keywords: `${combo.nombre}, combo, descuento, electrodomésticos, cuotas, financiación, contado`,
      openGraph: {
        type: 'website',
        locale: 'es_AR',
        url: `https://www.mundocuota.com.ar/combos/${resolvedParams.id}?share=final`,
        siteName: 'MaxiPet',
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
      title: "Combo - MaxiPet",
      description: "Descubre nuestros combos especiales con los mejores descuentos.",
    }
  }
}

export default async function ComboPage({ params }: ComboPageProps) {
  return <ComboPageClient params={params} />
}