'use client'

import { useState, useEffect } from 'react'
import { PlanFinanciacion } from '@/lib/products'
import { getPlanesProducto, calcularCuota, formatearPrecio, getTipoPlanesProducto, calcularAnticipo } from '@/lib/supabase-products'
import { useShoppingList } from '@/hooks/use-shopping-list'

interface FinancingPlansProps {
  productoId: string
  precio: number
  showDebug?: boolean
}

export default function FinancingPlans({ productoId, precio, showDebug = false }: FinancingPlansProps) {
  const [planes, setPlanes] = useState<PlanFinanciacion[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoPlanes, setTipoPlanes] = useState<'especiales' | 'default' | 'todos' | 'ninguno'>('ninguno')
  const { isInList, selectedPlans, setSelectedPlan } = useShoppingList()

  const inList = isInList(Number(productoId))
  const planActual = selectedPlans[productoId]

  useEffect(() => {
    async function loadPlanes() {
      try {
        setLoading(true)
        const [planesData, tipoData] = await Promise.all([
          getPlanesProducto(productoId),
          getTipoPlanesProducto(productoId)
        ])

        const planesUnicos = planesData.filter((plan, index, self) =>
          index === self.findIndex((p) => p.id === plan.id)
        )

        setPlanes(planesUnicos)
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

  const getTipoPlanesText = (tipo: string) => {
    switch (tipo) {
      case 'especiales': return 'Planes Especiales'
      case 'default': return 'Planes por Defecto'
      case 'todos': return 'Todos los Planes'
      default: return 'Sin Planes'
    }
  }

  const UMBRAL_SIN_MINIMO = 1

  const planesQueCalifican = planes.filter(plan => {
    if (plan.cuotas === 1) return true
    if (!plan.monto_minimo || plan.monto_minimo < UMBRAL_SIN_MINIMO) return true
    const cumpleMinimo = precio >= plan.monto_minimo
    const cumpleMaximo = !plan.monto_maximo || plan.monto_maximo === 0 || precio <= plan.monto_maximo
    return cumpleMinimo && cumpleMaximo
  })

  const planesFiltrados = planesQueCalifican

  const planesOrdenados = [...planesFiltrados].sort((a, b) => {
    const calculoA = calcularCuota(precio, a)
    const calculoB = calcularCuota(precio, b)
    if (!calculoA || !calculoB) return 0
    return calculoA.cuota_mensual - calculoB.cuota_mensual
  })

  const planesFinales = planesOrdenados.filter((plan, index, self) =>
    index === self.findIndex((p) => p.id === plan.id)
  )

  const colores = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-emerald-100 text-emerald-800', 'bg-orange-100 text-orange-800']

  const handlePlanClick = (plan: PlanFinanciacion, calculo: { cuota_mensual: number }) => {
    if (!inList) return
    // Si ya está seleccionado este plan, deseleccionar
    if (planActual?.planId === plan.id) {
      setSelectedPlan(productoId, null)
    } else {
      setSelectedPlan(productoId, {
        planId: plan.id,
        nombre: plan.nombre,
        cuotas: plan.cuotas,
        cuotaMensual: calculo.cuota_mensual
      })
    }
  }

  return (
    <div className="mt-3 space-y-2">
      {showDebug && (
        <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
          <strong>Tipo de planes:</strong> {getTipoPlanesText(tipoPlanes)} | <strong>Total:</strong> {planes.length} planes
        </div>
      )}

      {inList && (
        <p className="text-xs text-blue-600 font-semibold mb-1">Selecciona el plan de pago:</p>
      )}

      {planesFinales.map((plan, index) => {
        const calculo = calcularCuota(precio, plan)
        const anticipo = calcularAnticipo(precio, plan)
        if (!calculo) return null

        const sinInteres = plan.recargo_fijo === 0 && plan.recargo_porcentual === 0
        const esContado = plan.cuotas === 1

        let descuentoContado = 20
        if (esContado && plan.nombre) {
          const match = plan.nombre.match(/(\d+)%/i)
          if (match) {
            descuentoContado = parseInt(match[1])
          }
        }

        const precioContado = esContado ? precio * (1 - descuentoContado / 100) : calculo.cuota_mensual
        const isSelected = planActual?.planId === plan.id

        const baseClass = esContado ? 'bg-red-100 text-red-800' : colores[index % colores.length]
        const selectedClass = 'ring-2 ring-blue-500 bg-blue-200 text-blue-900'

        const content = (
          <div className="text-center leading-tight">
            {esContado ? (
              <>
                <div className="whitespace-nowrap text-lg">
                  Contado {descuentoContado}% OFF!
                </div>
                <div className="text-base">
                  ${formatearPrecio(precioContado)}
                </div>
              </>
            ) : (
              <>
                <div className="whitespace-nowrap text-base">
                  {plan.cuotas} {sinInteres ? 'Cuotas Sin interés' : 'cuotas'} de
                </div>
                <div className="text-sm">
                  ${formatearPrecio(calculo.cuota_mensual)}
                </div>
                {anticipo > 0 && (
                  <div className="whitespace-nowrap text-xs">
                    Anticipo: ${formatearPrecio(anticipo)}
                  </div>
                )}
              </>
            )}
          </div>
        )

        // Si el producto está en la lista, los planes son botones seleccionables
        if (inList) {
          return (
            <button
              key={`${productoId}-${plan.id}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePlanClick(plan, calculo) }}
              className={`py-2 px-2 sm:px-4 rounded-lg font-bold text-xs sm:text-sm w-full transition-all duration-200 ${
                isSelected ? selectedClass : baseClass
              } hover:opacity-80 cursor-pointer`}
            >
              {content}
              {isSelected && (
                <div className="text-xs mt-1 font-semibold text-blue-700">✓ Seleccionado</div>
              )}
            </button>
          )
        }

        // Si no está en la lista, solo se muestra como badge estático (como antes)
        return (
          <div
            key={`${productoId}-${plan.id}`}
            className={`py-2 px-2 sm:px-4 rounded-lg text-center font-bold text-xs sm:text-sm w-full ${baseClass}`}
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}
