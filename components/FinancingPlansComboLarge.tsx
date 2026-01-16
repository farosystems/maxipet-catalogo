'use client'

import { useState, useEffect, useMemo, memo } from 'react'
import { PlanFinanciacion } from '@/lib/products'
import { getPlanesCombo, calcularCuota, formatearPrecio, calcularAnticipo } from '@/lib/supabase-products'

interface FinancingPlansComboLargeProps {
  comboId: string
  precio: number
  showDebug?: boolean
  hasStock?: boolean
}

const FinancingPlansComboLarge = memo(function FinancingPlansComboLarge({ comboId, precio, showDebug = false, hasStock = true }: FinancingPlansComboLargeProps) {
  const [planes, setPlanes] = useState<PlanFinanciacion[]>([])
  const [loading, setLoading] = useState(true)

  // Memoizar cálculos costosos y ordenar de menor a mayor precio
  const calculatedPlanes = useMemo(() => {
    // Filtrar planes por monto_minimo y monto_maximo
    // Consideramos "sin mínimo" valores muy pequeños como 0.01
    const UMBRAL_SIN_MINIMO = 1

    const planesQueCalifican = planes.filter(plan => {
      // El plan de 1 cuota (contado) se muestra SIEMPRE
      if (plan.cuotas === 1) return true

      // Si el plan no tiene monto_minimo significativo (< 1), incluirlo siempre
      if (!plan.monto_minimo || plan.monto_minimo < UMBRAL_SIN_MINIMO) return true

      // Si tiene monto_minimo significativo, verificar que el precio lo cumpla
      const cumpleMinimo = precio >= plan.monto_minimo
      const cumpleMaximo = !plan.monto_maximo || plan.monto_maximo === 0 || precio <= plan.monto_maximo

      return cumpleMinimo && cumpleMaximo
    })

    // Mostrar todos los planes que califican (sin priorización)
    return planesQueCalifican.map(plan => {
      const calculo = calcularCuota(precio, plan)
      const anticipo = calcularAnticipo(precio, plan)
      return { plan, calculo, anticipo }
    })
    .filter(item => item.calculo)
    .sort((a, b) => {
      // Ordenar por cuota mensual EF de menor a mayor
      return a.calculo!.cuota_mensual - b.calculo!.cuota_mensual
    })
  }, [planes, precio])

  useEffect(() => {
    async function loadPlanes() {
      try {
        setLoading(true)
        const planesData = await getPlanesCombo(comboId)
        console.log('Planes cargados para combo', comboId, ':', planesData)

        // Deduplicar planes por ID como medida de seguridad adicional
        const planesUnicos = planesData.filter((plan, index, self) =>
          index === self.findIndex((p) => p.id === plan.id)
        )

        setPlanes(planesUnicos)
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

  // Mostrar todos los planes disponibles para este combo
  const colores = ['bg-orange-100 text-orange-800', 'bg-red-100 text-red-800', 'bg-pink-100 text-pink-800', 'bg-yellow-100 text-yellow-800']

  return (
    <div className={`bg-white rounded-lg p-4 sm:p-6 shadow-sm transition-all duration-300 ${
      !hasStock ? 'opacity-50 grayscale' : ''
    }`}>
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Opciones de Financiación</h3>
        {!hasStock && (
          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full font-semibold">
            NO DISPONIBLE
          </span>
        )}
      </div>

      {/* Información de debug */}
      {showDebug && (
        <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
          <strong>Planes del combo:</strong> {planes.length} planes disponibles
        </div>
      )}

      {!hasStock && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm font-medium text-center">
            Las opciones de financiación no están disponibles para combos sin stock
          </p>
        </div>
      )}

      <div className="space-y-2 sm:space-y-3">
        {calculatedPlanes.map(({ plan, calculo, anticipo }, index) => {
          const sinInteres = plan.recargo_fijo === 0 && plan.recargo_porcentual === 0
          const esContado = plan.cuotas === 1
          const precioContado = esContado ? precio * 0.8 : calculo!.cuota_mensual

          return (
            <div
              key={`${comboId}-${plan.id}`}
              className={`p-3 sm:p-4 rounded-lg sm:rounded-xl text-center font-bold text-sm sm:text-lg transition-all duration-300 ${
                esContado ? 'bg-red-100 text-red-800' : colores[index % colores.length]
              } ${!hasStock ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="mb-1 sm:mb-2">
                {esContado ? (
                  <>
                    {/* Plan de contado (1 cuota) */}
                    <div className="text-lg sm:text-2xl mb-1">
                      Contado 20% OFF!
                    </div>
                    <div className="text-xl sm:text-3xl">
                      ${formatearPrecio(precioContado)}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Planes normales */}
                    <div className="text-lg sm:text-2xl mb-1">
                      {plan.cuotas} {sinInteres ? 'Cuotas Sin interés' : 'cuotas mensuales'} de
                    </div>
                    <div className="text-xl sm:text-3xl">
                      ${formatearPrecio(calculo!.cuota_mensual)} {!sinInteres && 'EF'}
                    </div>
                  </>
                )}
              </div>
              {!esContado && anticipo > 0 && (
                <div className="text-xs sm:text-base font-semibold opacity-90 border-t pt-1 sm:pt-2 mt-1 sm:mt-2">
                  Anticipo: ${formatearPrecio(anticipo)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default FinancingPlansComboLarge