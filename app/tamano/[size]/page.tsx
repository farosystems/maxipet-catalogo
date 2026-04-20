import { Metadata } from 'next'
import { Suspense } from 'react'
import TamanoCategoryClient from './TamanoCategoryClient'

interface TamanoCategoryPageProps {
  params: Promise<{
    size: string
  }>
}

export async function generateMetadata({ params }: TamanoCategoryPageProps): Promise<Metadata> {
  const { size } = await params
  const tamanoFormateado = size.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())

  return {
    title: `Productos Tamaño ${tamanoFormateado} - MaxiPet`,
    description: `Encuentra todos los productos de tamaño ${tamanoFormateado} para tus mascotas en MaxiPet`,
  }
}

export default async function TamanoCategoryPage({ params }: TamanoCategoryPageProps) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <TamanoCategoryClient params={params} />
    </Suspense>
  )
}
