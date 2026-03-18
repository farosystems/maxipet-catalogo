import { Metadata } from 'next'
import { Suspense } from 'react'
import TamañoCategoryClient from './TamañoCategoryClient'

interface TamañoCategoryPageProps {
  params: Promise<{
    size: string
  }>
}

export async function generateMetadata({ params }: TamañoCategoryPageProps): Promise<Metadata> {
  const { size } = await params
  const tamañoFormateado = size.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())

  return {
    title: `Productos Tamaño ${tamañoFormateado} - MaxiPet`,
    description: `Encuentra todos los productos de tamaño ${tamañoFormateado} para tus mascotas en MaxiPet`,
  }
}

export default async function TamañoCategoryPage({ params }: TamañoCategoryPageProps) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <TamañoCategoryClient params={params} />
    </Suspense>
  )
}
