'use client'

import { useState, useEffect } from 'react'
import { PlanFinanciacion } from '@/lib/products'
import { getPlanesProducto, calcularCuota, formatearPrecio, getTipoPlanesProducto, calcularAnticipo } from '@/lib/supabase-products'

interface FinancingPlansProps {
  productoId: string
  precio: number
  showDebug?: boolean
}

export default function FinancingPlans({ productoId, precio, showDebug = false }: FinancingPlansProps) {
  const [planes, setPlanes] = useState<PlanFinanciacion[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoPlanes, setTipoPlanes] = useState<'especiales' | 'default' | 'todos' | 'ninguno'>('ninguno')

  useEffect(() => {
    async function loadPlanes() {
      try {
        setLoading(true)
        const [planesData, tipoData] = await Promise.all([
          getPlanesProducto(productoId),
          getTipoPlanesProducto(productoId)
        ])
        //console.log('Planes cargados para producto', productoId, ':', planesData)
        //console.log('Tipo de planes para producto', productoId, ':', tipoData)
        
        setPlanes(planesData)
        setTipoPlanes(tipoData)
      } catch (error) {
        console.error('Error loading financing plans:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPlanes()
  }, [productoId])

  if (loading) {
    return (
      <div className="mt-3 p-2 bg-gray-50 rounded">
        <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (planes.length === 0) {
    return null
  }

  // Función para obtener el texto descriptivo del tipo de planes
  const getTipoPlanesText = (tipo: string) => {
    switch (tipo) {
      case 'especiales':
        return 'Planes Especiales'
      case 'default':
        return 'Planes por Defecto'
      case 'todos':
        return 'Todos los Planes'
      default:
        return 'Sin Planes'
    }
  }

  // Mostrar todos los planes disponibles para este producto
  const colores = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-orange-100 text-orange-800']

  return (
    <div className="mt-3 space-y-2">
      {/* Información de debug */}
      {showDebug && (
        <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
          <strong>Tipo de planes:</strong> {getTipoPlanesText(tipoPlanes)} | <strong>Total:</strong> {planes.length} planes
        </div>
      )}
      
      {planes.map((plan, index) => {
        const calculo = calcularCuota(precio, plan)
        const anticipo = calcularAnticipo(precio, plan)
        if (!calculo) return null

        return (
          <div
            key={plan.id}
            className={`p-3 rounded-lg text-center font-bold text-sm ${
              colores[index % colores.length]
            }`}
          >
            <div className="mb-1">
              {plan.cuotas} CUOTAS MENSUALES x ${formatearPrecio(calculo.cuota_mensual)} EF / ${formatearPrecio(calculo.cuota_mensual_electro)} P.ELEC
            </div>
            {anticipo > 0 && (
              <div className="text-xs font-normal opacity-90">
                Anticipo: ${formatearPrecio(anticipo)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
} 