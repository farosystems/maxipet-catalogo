"use client"

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useShoppingList } from '@/hooks/use-shopping-list'
import { Product } from '@/lib/products'
import WhatsAppButton from './WhatsAppButton'

interface ShoppingListModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShoppingListModal({ isOpen, onClose }: ShoppingListModalProps) {
  const { items, removeItem, clearList, itemCount } = useShoppingList()

  if (!isOpen) return null

  // Crear un producto virtual que contenga la información de todos los productos de la lista
  const virtualProduct = {
    id: 0,
    descripcion: `Lista de ${itemCount} producto${itemCount !== 1 ? 's' : ''}`,
    name: `Lista de ${itemCount} producto${itemCount !== 1 ? 's' : ''}`,
    categoria: { descripcion: 'Múltiples categorías' },
    marca: { descripcion: 'Varias marcas' },
    precio: 0,
    imagen: '/placeholder.jpg',
    descripcion_detallada: items.map((item, index) => {
      let productLine = `${index + 1}. ${item.descripcion || item.name || 'Producto'}`
      
      if (item.categoria?.descripcion) {
        productLine += `\n   Categoría: ${item.categoria.descripcion}`
      }
      
      if (item.marca?.descripcion) {
        productLine += `\n   Marca: ${item.marca.descripcion}`
      }
      
      return productLine
    }).join('\n\n')
  }

  // Debug: verificar que el producto virtual se crea correctamente
  console.log('🔍 Producto virtual creado:', virtualProduct)
  console.log('🔍 Descripción detallada:', virtualProduct.descripcion_detallada)

  const handleClearList = () => {
    clearList()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mi Lista de Compra</h2>
            <p className="text-gray-600">{itemCount} producto{itemCount !== 1 ? 's' : ''} seleccionado{itemCount !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Tu lista está vacía
              </h3>
              <p className="text-gray-500">
                Agrega productos desde las tarjetas o páginas de productos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  {/* Imagen del producto */}
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.imagen || item.image || '/placeholder.jpg'}
                      alt={item.descripcion || item.name || 'Producto'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.descripcion || item.name || 'Producto'}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      {item.categoria && (
                        <span className="text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
                          {item.categoria.descripcion}
                        </span>
                      )}
                      {item.marca && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          {item.marca.descripcion}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-500 hover:text-red-700"
                    title="Eliminar de la lista"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={handleClearList}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Limpiar Lista
              </button>
                             <div className="flex-1">
                 <WhatsAppButton product={virtualProduct} />
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
