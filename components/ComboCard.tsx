"use client"

import Link from "next/link"
import { Heart, Clock, ShoppingCart, Check } from "lucide-react"
import { Combo } from "@/lib/products"
import { useShoppingList } from "@/hooks/use-shopping-list"
import { isComboValid } from "@/lib/supabase-products"
import FinancingPlansCombo from "./FinancingPlansCombo"

interface ComboCardProps {
  combo: Combo
}

export default function ComboCard({ combo }: ComboCardProps) {
  const { addItem, removeItem, isInList } = useShoppingList()

  // Convertir combo a formato de producto para la lista de compras
  const comboAsProduct = {
    id: combo.id.toString(),
    descripcion: combo.nombre,
    precio: combo.precio_combo,
    imagen: combo.imagen || '/placeholder.jpg',
    fk_id_categoria: 1, // Categoría por defecto para combos
    fk_id_marca: 1, // Marca por defecto para combos
    destacado: false,
    tiene_stock: combo.activo && isComboValid(combo),
    descripcion_detallada: combo.descripcion || combo.nombre,
    stock: 1
  }

  const isInFavorites = isInList(combo.id)
  const isValid = isComboValid(combo)
  const hasDiscount = combo.descuento_porcentaje > 0

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInFavorites) {
      removeItem(combo.id)
    } else {
      addItem(comboAsProduct)
    }
  }

  const comboUrl = `/combos/${combo.id}`

  return (
    <Link href={comboUrl} className="block">
      <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 group cursor-pointer relative ${
        isValid
          ? 'hover:shadow-xl hover:scale-[1.03] hover:z-50 active:scale-95'
          : 'opacity-75 grayscale-[0.3]'
      }`}>
        {/* Imagen del combo */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={combo.imagen || '/placeholder.jpg'}
            alt={combo.nombre}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {/* Icono de Favoritos - Esquina superior izquierda (solo si está vigente) */}
          {isValid && (
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-2 left-2 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10 ${
                isInFavorites
                  ? 'text-white'
                  : 'bg-white/90 text-gray-600 hover:bg-white'
              }`}
              style={isInFavorites ? { backgroundColor: '#ec3036' } : {}}
              onMouseEnter={(e) => {
                if (!isInFavorites) {
                  e.currentTarget.style.color = '#ec3036'
                }
              }}
              onMouseLeave={(e) => {
                if (!isInFavorites) {
                  e.currentTarget.style.color = ''
                }
              }}
              title={isInFavorites ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-300 ${
                  isInFavorites ? 'fill-current' : ''
                }`}
              />
            </button>
          )}

          {/* Badge de descuento - Esquina superior derecha */}
          {hasDiscount && isValid && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
              -{combo.descuento_porcentaje}%
            </div>
          )}

          {/* Badge No Vigente - Esquina superior derecha */}
          {!isValid && (
            <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-1">
              <Clock className="w-3 h-3" />
              No vigente
            </div>
          )}
        </div>

        {/* Información del combo */}
        <div className="p-2 sm:p-3">
          {/* Etiqueta de Combo */}
          <div className="flex gap-1 sm:gap-2 mb-2">
            <span className="text-xs text-white bg-gradient-to-r from-orange-500 to-orange-600 px-2 py-1 rounded-full font-semibold shadow-sm">
              COMBO
            </span>
          </div>

          {/* Título del combo */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2">
            {combo.nombre}
          </h3>

          {/* Planes de Financiación - Solo si el combo está vigente */}
          {isValid && (
            <FinancingPlansCombo
              comboId={combo.id.toString()}
              precio={combo.precio_combo}
            />
          )}

          {/* Vigencia */}
          {combo.fecha_vigencia_fin && (
            <div className="text-xs text-gray-500 mb-2">
              Válido hasta: {new Date(combo.fecha_vigencia_fin).toLocaleDateString()}
            </div>
          )}

          {/* Botón Agregar a lista */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (isInFavorites) {
                removeItem(combo.id)
              } else {
                addItem(comboAsProduct)
              }
            }}
            disabled={!isValid}
            className={`w-full mt-2 py-1.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              !isValid
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isInFavorites
                ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                : 'text-white hover:opacity-90 shadow-md'
            }`}
            style={isValid && !isInFavorites ? { backgroundColor: '#0070bb' } : {}}
          >
            {!isValid ? (
              <>No vigente</>
            ) : isInFavorites ? (
              <><Check className="w-4 h-4" /> En tu lista</>
            ) : (
              <><ShoppingCart className="w-4 h-4" /> Agregar a lista</>
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}