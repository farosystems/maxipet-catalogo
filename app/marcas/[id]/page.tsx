import { Metadata } from 'next'
import { Suspense } from 'react'
import MarcaCategoryClient from './MarcaCategoryClient'

interface MarcaCategoryPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: MarcaCategoryPageProps): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Productos por Marca - MaxiPet`,
    description: `Encuentra todos los productos de esta marca para tus mascotas en MaxiPet`,
  }
}

export default async function MarcaCategoryPage({ params }: MarcaCategoryPageProps) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <MarcaCategoryClient params={params} />
    </Suspense>
  )
}
