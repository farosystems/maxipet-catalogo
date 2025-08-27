"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

interface ProductImageGalleryProps {
  images?: string[]
  productName: string
  isFeatured?: boolean
}

export default function ProductImageGallery({ images, productName, isFeatured = false }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Filtrar imágenes que no estén vacías o sean null/undefined
  const validImages = (images || []).filter(img => img && img.trim() !== '')
  
  // Debug: Log para verificar las imágenes
  //console.log('🔍 ProductImageGallery - Imágenes recibidas:', images)
  //console.log('🔍 ProductImageGallery - Imágenes válidas:', validImages)
  //console.log('🔍 ProductImageGallery - Índice actual:', currentImageIndex)

  if (validImages.length === 0) {
    return (
      <div className="relative group">
        <div className="bg-white rounded-2xl shadow-xl p-8 overflow-hidden">
          <div className="relative aspect-square">
            <Image
              src="/placeholder.svg"
              alt={productName}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            
            {/* Badge Destacado */}
            {isFeatured && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                <Star className="mr-2" size={14} />
                Destacado
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    //console.log('🔍 nextImage - Antes:', currentImageIndex, 'Total:', validImages.length)
    setCurrentImageIndex((prev) => {
      const next = (prev + 1) % validImages.length
      //console.log('🔍 nextImage - Después:', next)
      return next
    })
  }

  const prevImage = () => {
    //console.log('🔍 prevImage - Antes:', currentImageIndex, 'Total:', validImages.length)
    setCurrentImageIndex((prev) => {
      const prevIndex = (prev - 1 + validImages.length) % validImages.length
      //console.log('🔍 prevImage - Después:', prevIndex)
      return prevIndex
    })
  }

  const goToImage = (index: number) => {
    //console.log('🔍 goToImage - Ir a índice:', index)
    setCurrentImageIndex(index)
  }

  return (
    <div className="relative group">
      <div className="bg-white rounded-2xl shadow-xl p-8 overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={validImages[currentImageIndex]}
            alt={`${productName} - Imagen ${currentImageIndex + 1}`}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          
          {/* Badge Destacado */}
          {isFeatured && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
              <Star className="mr-2" size={14} />
              Destacado
            </div>
          )}

          {/* Botones de navegación - solo mostrar si hay más de una imagen */}
          {validImages.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 z-10 cursor-pointer"
                aria-label="Imagen anterior"
                type="button"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 z-10 cursor-pointer"
                aria-label="Imagen siguiente"
                type="button"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
            </>
          )}

          {/* Indicador de imagen actual */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {validImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails - solo mostrar si hay más de una imagen */}
        {validImages.length > 1 && (
          <div className="flex justify-center mt-6 space-x-3">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer ${
                  index === currentImageIndex 
                    ? 'border-2 border-violet-500 scale-105' 
                    : 'border border-gray-300 hover:border-violet-300 hover:scale-105'
                }`}
                aria-label={`Ver imagen ${index + 1}`}
                type="button"
              >
                <Image 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`} 
                  width={70} 
                  height={70} 
                  className="object-contain rounded-lg" 
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
