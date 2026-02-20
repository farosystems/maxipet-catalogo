"use client"

import { useState } from 'react'
import { X, Trash2, MessageCircle, Truck, MapPin } from 'lucide-react'
import { useShoppingList } from '@/hooks/use-shopping-list'
import WhatsAppButton from './WhatsAppButton'

interface DireccionEntrega {
  direccion: string
  localidad: string
  codigoPostal: string
}

interface ShoppingListModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShoppingListModal({ isOpen, onClose }: ShoppingListModalProps) {
  const { items, removeItem, clearList, itemCount, selectedPlans, quantities } = useShoppingList()

  const [conEnvio, setConEnvio] = useState(false)
  const [mismadireccion, setMismaDireccion] = useState(true)
  const [direccionGeneral, setDireccionGeneral] = useState<DireccionEntrega>({ direccion: '', localidad: '', codigoPostal: '' })
  const [direccionesPorProducto, setDireccionesPorProducto] = useState<Record<string | number, DireccionEntrega>>({})

  if (!isOpen) return null

  const handleDireccionGeneralChange = (field: keyof DireccionEntrega, value: string) => {
    setDireccionGeneral(prev => ({ ...prev, [field]: value }))
  }

  const handleDireccionProductoChange = (productId: string | number, field: keyof DireccionEntrega, value: string) => {
    setDireccionesPorProducto(prev => ({
      ...prev,
      [productId]: { ...{ direccion: '', localidad: '', codigoPostal: '' }, ...prev[productId], [field]: value }
    }))
  }

  // Build the virtualProduct descripcion_detallada including shipping info
  const buildDescripcionDetallada = () => {
    let desc = items.map((item, index) => {
      const quantity = quantities[item.id] || 1
      let productLine = `${index + 1}. ${item.descripcion || item.name || 'Producto'}${quantity > 1 ? ` (Cantidad: ${quantity})` : ''}`

      if (item.categoria?.descripcion) {
        productLine += `\n   Categoría: ${item.categoria.descripcion}`
      }
      if (item.marca?.descripcion) {
        productLine += `\n   Marca: ${item.marca.descripcion}`
      }

      // Plan de pago seleccionado
      const plan = selectedPlans[item.id]
      if (plan) {
        if (plan.cuotas === 1) {
          productLine += `\n   💳 Forma de pago: Contado (${plan.nombre})`
        } else {
          productLine += `\n   💳 Forma de pago: ${plan.nombre} — ${plan.cuotas} cuotas de $${plan.cuotaMensual.toLocaleString('es-AR')}`
        }
      }

      // Per-product address if not using same address
      if (conEnvio && !mismadireccion) {
        const dir = direccionesPorProducto[item.id]
        if (dir) {
          productLine += `\n   📍 Dirección de entrega: ${dir.direccion}, ${dir.localidad}, CP: ${dir.codigoPostal}`
        }
      }

      return productLine
    }).join('\n\n')

    // Shipping section at the end
    if (conEnvio) {
      desc += '\n\n---'
      if (mismadireccion) {
        desc += `\n📦 Solicito envío a:\n   Dirección: ${direccionGeneral.direccion}\n   Localidad: ${direccionGeneral.localidad}\n   Código Postal: ${direccionGeneral.codigoPostal}`
      } else {
        desc += '\n📦 Solicito envío (las direcciones están indicadas por producto arriba)'
      }
    } else {
      desc += '\n\n---\n🏪 Retiro en el local'
    }

    return desc
  }

  const virtualProduct = {
    id: '0',
    descripcion: `Lista de ${itemCount} producto${itemCount !== 1 ? 's' : ''}`,
    name: `Lista de ${itemCount} producto${itemCount !== 1 ? 's' : ''}`,
    categoria: { id: 0, descripcion: 'Múltiples categorías', created_at: '' },
    marca: { id: 0, descripcion: 'Varias marcas', created_at: '' },
    precio: 0,
    imagen: '/placeholder.jpg',
    tiene_stock: true,
    stock: 1,
    fk_id_categoria: 0,
    fk_id_marca: 0,
    destacado: false,
    descripcion_detallada: buildDescripcionDetallada()
  }

  // Validate: if conEnvio, check that required fields are filled
  const isEnvioValido = () => {
    if (!conEnvio) return true
    if (mismadireccion) {
      return direccionGeneral.direccion.trim() !== '' && direccionGeneral.localidad.trim() !== '' && direccionGeneral.codigoPostal.trim() !== ''
    }
    // Per product: all products must have address filled
    return items.every(item => {
      const dir = direccionesPorProducto[item.id]
      return dir && dir.direccion.trim() !== '' && dir.localidad.trim() !== '' && dir.codigoPostal.trim() !== ''
    })
  }

  const handleClearList = () => {
    clearList()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mis Pedidos</h2>
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
        <div className="p-6">
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
            <>
              {/* Lista de productos */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      {/* Imagen */}
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.imagen || item.image || '/placeholder.jpg'}
                          alt={item.descripcion || item.name || 'Producto'}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.descripcion || item.name || 'Producto'}
                        </h3>
                        <div className="flex gap-2 mt-1 flex-wrap items-center">
                          {/* Quantity badge */}
                          {(quantities[item.id] || 1) > 1 && (
                            <span className="text-xs text-white bg-gray-700 px-2 py-1 rounded-full font-bold">
                              x{quantities[item.id]}
                            </span>
                          )}
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
                        {/* Plan seleccionado */}
                        {selectedPlans[item.id] && (
                          <div className="mt-1.5 text-xs font-semibold text-white bg-blue-600 inline-block px-2 py-0.5 rounded-full">
                            💳 {selectedPlans[item.id].cuotas === 1
                              ? 'Contado'
                              : `${selectedPlans[item.id].cuotas} cuotas de $${selectedPlans[item.id].cuotaMensual.toLocaleString('es-AR')}`}
                          </div>
                        )}
                        {!selectedPlans[item.id] && (
                          <div className="mt-1.5 text-xs text-gray-400 italic">
                            Sin plan seleccionado — selecciona en la card
                          </div>
                        )}
                      </div>

                      {/* Eliminar */}
                      <button
                        onClick={() => removeItem(Number(item.id))}
                        className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-500 hover:text-red-700"
                        title="Eliminar de la lista"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Dirección por producto (solo si envío habilitado y misma dirección desmarcado) */}
                    {conEnvio && !mismadireccion && (
                      <div className="px-4 pb-4 border-t border-gray-200 pt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                          <MapPin size={12} /> Dirección de entrega para este producto
                        </p>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Dirección (ej: Av. Corrientes 1234)"
                            value={direccionesPorProducto[item.id]?.direccion || ''}
                            onChange={(e) => handleDireccionProductoChange(item.id, 'direccion', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Localidad"
                              value={direccionesPorProducto[item.id]?.localidad || ''}
                              onChange={(e) => handleDireccionProductoChange(item.id, 'localidad', e.target.value)}
                              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <input
                              type="text"
                              placeholder="Código Postal"
                              value={direccionesPorProducto[item.id]?.codigoPostal || ''}
                              onChange={(e) => handleDireccionProductoChange(item.id, 'codigoPostal', e.target.value)}
                              className="w-28 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Sección de envío */}
              <div className="border border-gray-200 rounded-xl p-4 mb-4">
                {/* Checkbox con envío */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={conEnvio}
                    onChange={(e) => setConEnvio(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded accent-blue-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 flex items-center gap-2">
                      <Truck size={18} className="text-blue-600" /> Solicito envío a domicilio
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">Si no lo marcas, se asume retiro en el local</p>
                  </div>
                </label>

                {/* Campos de dirección cuando envío está habilitado */}
                {conEnvio && (
                  <div className="mt-4 pl-8">
                    {/* Checkbox misma dirección */}
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={mismadireccion}
                        onChange={(e) => setMismaDireccion(e.target.checked)}
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 font-medium">Todos los productos van a la misma dirección</span>
                    </label>

                    {/* Dirección general (cuando misma dirección está marcado) */}
                    {mismadireccion && (
                      <div className="space-y-2 bg-blue-50 rounded-lg p-3">
                        <input
                          type="text"
                          placeholder="Dirección (ej: Av. Corrientes 1234)"
                          value={direccionGeneral.direccion}
                          onChange={(e) => handleDireccionGeneralChange('direccion', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Localidad"
                            value={direccionGeneral.localidad}
                            onChange={(e) => handleDireccionGeneralChange('localidad', e.target.value)}
                            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <input
                            type="text"
                            placeholder="Código Postal"
                            value={direccionGeneral.codigoPostal}
                            onChange={(e) => handleDireccionGeneralChange('codigoPostal', e.target.value)}
                            className="w-28 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* Mensaje indicador cuando es dirección por producto */}
                    {!mismadireccion && (
                      <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                        Completa la dirección de entrega en cada producto de la lista.
                      </p>
                    )}
                  </div>
                )}

                {/* Leyenda de demoras */}
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-amber-700 font-semibold">Tiempos estimados de envío:</p>
                  <ul className="text-xs text-amber-600 mt-1 space-y-0.5 list-disc list-inside">
                    <li>Capital Federal: 2 a 3 días hábiles</li>
                    <li>Gran Buenos Aires: 3 a 5 días hábiles</li>
                    <li>Interior provincia de Buenos Aires: 5 a 7 días hábiles</li>
                    <li>Resto del país: 7 a 14 días hábiles</li>
                  </ul>
                  <p className="text-xs text-amber-500 mt-1 italic">Los plazos pueden variar según la disponibilidad del producto y la empresa de transporte.</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            {conEnvio && !isEnvioValido() && (
              <p className="text-xs text-red-500 mb-3 text-center">
                Completa todos los campos de dirección antes de consultar al vendedor.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleClearList}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Limpiar Lista
              </button>
              <div className={`flex-1 ${conEnvio && !isEnvioValido() ? 'opacity-50 pointer-events-none' : ''}`}>
                <WhatsAppButton product={virtualProduct} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
