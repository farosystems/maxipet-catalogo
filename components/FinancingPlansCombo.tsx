'use client'

import { useState, useEffect } from 'react'
import { PlanFinanciacion } from '@/lib/products'
import { getPlanesCombo, calcularCuota, formatearPrecio, calcularAnticipo } from '@/lib/supabase-products'

interface FinancingPlansComboProps {
  comboId: string
  precio: number
  showDebug?: boolean
}

export default function FinancingPlansCombo({ comboId, precio, showDebug = false }: FinancingPlansComboProps) {
  const [planes, setPlanes] = useState<PlanFinanciacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPlanes() {
      try {
        setLoading(true)
        const planesData = await getPlanesCombo(comboId)
        console.log('Planes cargados para combo', comboId, ':', planesData)

        setPlanes(planesData)
      } catch (error) {
        console.error('Error loading combo financing plans:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPlanes()
  }, [comboId])

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

  // Ordenar planes de menor a mayor precio (cuota mensual)
  const planesOrdenados = [...planes].sort((a, b) => {
    const calculoA = calcularCuota(precio, a)
    const calculoB = calcularCuota(precio, b)

    if (!calculoA || !calculoB) return 0

    // Ordenar por cuota mensual EF de menor a mayor
    return calculoA.cuota_mensual - calculoB.cuota_mensual
  })

  // Mostrar todos los planes disponibles para este combo
  const colores = ['bg-orange-100 text-orange-800', 'bg-red-100 text-red-800', 'bg-pink-100 text-pink-800', 'bg-yellow-100 text-yellow-800']

  return (
    <div className="mt-3 space-y-2">
      {/* Información de debug */}
      {showDebug && (
        <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
          <strong>Planes del combo:</strong> {planes.length} planes disponibles
        </div>
      )}

      {planesOrdenados.map((plan, index) => {
        const calculo = calcularCuota(precio, plan)
        const anticipo = calcularAnticipo(precio, plan)
        if (!calculo) return null

        const sinInteres = plan.recargo_fijo === 0 && plan.recargo_porcentual === 0

        return (
          <div
            key={plan.id}
            className={`py-2 px-2 sm:px-4 rounded-lg text-center font-bold text-xs sm:text-sm w-full ${
              colores[index % colores.length]
            }`}
          >
            <div className="text-center leading-tight">
              {/* Primera línea: cuotas mensuales */}
              <div className="whitespace-nowrap text-base lowercase">
                {plan.cuotas} {sinInteres ? 'Cuotas Sin interés' : 'cuotas mensuales'} de
              </div>
              {/* Segunda línea: precio EF */}
              <div className="text-sm lowercase">
                ${formatearPrecio(calculo.cuota_mensual)} {!sinInteres && 'ef'}
              </div>
              {anticipo > 0 && (
                <div className="whitespace-nowrap text-xs">
                  Anticipo: ${formatearPrecio(anticipo)}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}