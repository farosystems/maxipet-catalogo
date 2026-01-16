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

        // Debug ampliado para todos los productos con error
        if (['201', '204', '189', '15', '180', '10'].includes(productoId)) {
          console.log(`📥 CARGA [${productoId}]: Planes recibidos =`, planesData.map(p => ({ id: p.id, nombre: p.nombre })))
          console.log(`📥 CARGA [${productoId}]: IDs recibidos =`, planesData.map(p => p.id))
        }

        // Deduplicar planes por ID como medida de seguridad adicional
        const planesUnicos = planesData.filter((plan, index, self) =>
          index === self.findIndex((p) => p.id === plan.id)
        )

        if (['201', '204', '189', '15', '180', '10'].includes(productoId)) {
          console.log(`✅ DEDUP [${productoId}]: Planes después de deduplicar =`, planesUnicos.map(p => ({ id: p.id, nombre: p.nombre })))
          console.log(`✅ DEDUP [${productoId}]: Total planes únicos =`, planesUnicos.length)
        }

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
  const planesFiltrados = planesQueCalifican

  // Debug: verificar duplicados después del filtrado
  if (['201', '204', '189', '15', '180', '10'].includes(productoId)) {
    console.log(`🔍 FILTRADO [${productoId}]: planesFiltrados IDs =`, planesFiltrados.map(p => p.id))
  }

  // Ordenar planes de menor a mayor precio (cuota mensual)
  const planesOrdenados = [...planesFiltrados].sort((a, b) => {
    const calculoA = calcularCuota(precio, a)
    const calculoB = calcularCuota(precio, b)

    if (!calculoA || !calculoB) return 0

    // Ordenar por cuota mensual EF de menor a mayor
    return calculoA.cuota_mensual - calculoB.cuota_mensual
  })

  // DEDUPLICACIÓN FINAL CRÍTICA: eliminar duplicados por ID justo antes del render
  const planesFinales = planesOrdenados.filter((plan, index, self) =>
    index === self.findIndex((p) => p.id === plan.id)
  )

  // Mostrar todos los planes disponibles para este producto
  const colores = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-emerald-100 text-emerald-800', 'bg-orange-100 text-orange-800']

  // Debug crítico: verificar duplicados justo antes del render
  if (['201', '204', '189', '15', '180', '10'].includes(productoId)) {
    console.log(`🚨 RENDER [${productoId}]: planesFinales =`, planesFinales.map(p => ({ id: p.id, nombre: p.nombre })))
    console.log(`🚨 RENDER [${productoId}]: IDs =`, planesFinales.map(p => p.id))
    console.log(`🚨 RENDER [${productoId}]: planesFinales.length =`, planesFinales.length)
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Información de debug */}
      {showDebug && (
        <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
          <strong>Tipo de planes:</strong> {getTipoPlanesText(tipoPlanes)} | <strong>Total:</strong> {planes.length} planes
        </div>
      )}

      {planesFinales.map((plan, index) => {
        const calculo = calcularCuota(precio, plan)
        const anticipo = calcularAnticipo(precio, plan)
        if (!calculo) return null

        const sinInteres = plan.recargo_fijo === 0 && plan.recargo_porcentual === 0
        const esContado = plan.cuotas === 1

        // Extraer porcentaje del nombre del plan (ej: "Contado 20%off" -> 20)
        let descuentoContado = 20 // valor por defecto
        if (esContado && plan.nombre) {
          const match = plan.nombre.match(/(\d+)%/i)
          if (match) {
            descuentoContado = parseInt(match[1])
          }
        }

        const precioContado = esContado ? precio * (1 - descuentoContado / 100) : calculo.cuota_mensual

        return (
          <div
            key={`${productoId}-${plan.id}`}
            className={`py-2 px-2 sm:px-4 rounded-lg text-center font-bold text-xs sm:text-sm w-full ${
              esContado ? 'bg-red-100 text-red-800' : colores[index % colores.length]
            }`}
          >
            <div className="text-center leading-tight">
              {esContado ? (
                <>
                  {/* Plan de contado (1 cuota) */}
                  <div className="whitespace-nowrap text-lg">
                    Contado {descuentoContado}% OFF!
                  </div>
                  <div className="text-base">
                    ${formatearPrecio(precioContado)}
                  </div>
                </>
              ) : (
                <>
                  {/* Planes normales */}
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
          </div>
        )
      })}
    </div>
  )
} 