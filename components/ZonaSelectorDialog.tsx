"use client"

import { useState } from "react"
import { X, MapPin, Phone } from "lucide-react"
import { useZonas } from "@/hooks/use-zonas"
import type { Product } from "@/lib/products"

interface ZonaSelectorDialogProps {
  isOpen: boolean
  onClose: () => void
  product: Product
}

export default function ZonaSelectorDialog({ isOpen, onClose, product }: ZonaSelectorDialogProps) {
  const { zonas, configuracionZonas, loading, error, getTelefonoZona } = useZonas()
  const [selectedZona, setSelectedZona] = useState<number | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Función para generar el mensaje de WhatsApp
  const generateWhatsAppMessage = (product: Product): string => {
    // Verificar si es un producto virtual de lista (tiene descripcion_detallada)
    if (product.descripcion_detallada && product.descripcion?.includes('Lista de')) {
      let message = `Hola! 👋 Me interesa consultar sobre los siguientes productos:\n\n`
      
      // Usar la descripción detallada que contiene la lista de productos
      message += product.descripcion_detallada
      
      message += `\n\n¿Podrían brindarme más información sobre estos productos?`
      
      return message
    }
    
    // Mensaje normal para productos individuales
    const productInfo = product.descripcion || product.name || 'este producto'
    
    let message = `Hola! 👋 Me interesa saber más información sobre: ${productInfo}`
    
    // Agregar información de categoría y marca si están disponibles
    if (product.categoria?.descripcion || product.marca?.descripcion) {
      message += '\n\n'
      if (product.categoria?.descripcion) {
        message += `Categoría: ${product.categoria.descripcion}`
      }
      if (product.marca?.descripcion) {
        message += product.categoria?.descripcion ? ` | Marca: ${product.marca.descripcion}` : `Marca: ${product.marca.descripcion}`
      }
    }
    
    message += `\n\n¿Podrían brindarme más detalles sobre este producto?`
    
    return message
  }

  const handleZonaSelect = async (zonaId: number) => {
    setSelectedZona(zonaId)
    setIsRedirecting(true)
    try {
      const telefono = await getTelefonoZona(zonaId)
      if (telefono) {
        const message = generateWhatsAppMessage(product)
        const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
        onClose()
      } else {
        alert('No se encontró un número de teléfono para esta zona')
      }
    } catch (err) {
      console.error('Error al redirigir a WhatsApp:', err)
      alert('Error al conectar con WhatsApp')
    } finally {
      setIsRedirecting(false)
      setSelectedZona(null)
    }
  }

  // Filtrar zonas que tienen configuración de teléfono
  const zonasConTelefono = zonas.filter(zona => 
    configuracionZonas.some(config => config.fk_id_zona === zona.id)
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300 ease-out">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <MapPin size={28} />
            <div>
              <h2 className="text-xl font-bold">Selecciona tu zona</h2>
              <p className="text-green-100 text-sm">Elige la zona más cercana para contactarte</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando zonas...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : zonasConTelefono.length === 0 ? (
            <div className="text-center py-8">
              <Phone size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No hay zonas configuradas con números de teléfono</p>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {zonasConTelefono.map((zona) => {
                const config = configuracionZonas.find(c => c.fk_id_zona === zona.id)
                return (
                  <button
                    key={zona.id}
                    onClick={() => handleZonaSelect(zona.id)}
                    disabled={isRedirecting}
                    className="w-full p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <MapPin size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                            {zona.nombre || `Zona ${zona.id}`}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center space-x-1">
                            <Phone size={14} />
                            <span>{config?.telefono}</span>
                          </p>
                        </div>
                      </div>
                      {isRedirecting && selectedZona === zona.id && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            Al seleccionar una zona, serás redirigido a WhatsApp con el número correspondiente
          </p>
        </div>
      </div>
    </div>
  )
}
