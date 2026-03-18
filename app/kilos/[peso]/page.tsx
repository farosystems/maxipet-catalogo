import { Metadata } from 'next'
import { Suspense } from 'react'
import KilosCategoryClient from './KilosCategoryClient'

interface KilosCategoryPageProps {
  params: Promise<{
    peso: string
  }>
}

export async function generateMetadata({ params }: KilosCategoryPageProps): Promise<Metadata> {
  const { peso } = await params
  const pesoFormateado = peso.replace('-', ' ')

  return {
    title: `Productos de ${pesoFormateado} - MaxiPet`,
    description: `Encuentra todos los productos de ${pesoFormateado} para tus mascotas en MaxiPet`,
  }
}

export default async function KilosCategoryPage({ params }: KilosCategoryPageProps) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <KilosCategoryClient params={params} />
    </Suspense>
  )
}
