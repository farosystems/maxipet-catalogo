"use client"

import Link from "next/link"
import { Heart, Tag, ShoppingCart, Check, Minus, Plus } from "lucide-react"
import { Product } from "@/lib/products"
import FinancingPlans from "./FinancingPlans"
import { useShoppingList } from "@/hooks/use-shopping-list"
import { formatearPrecio, isOfertaVigente } from "@/lib/supabase-products"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, removeItem, isInList, quantities, setQuantity } = useShoppingList()
  const productCategory = product.categoria?.descripcion || product.category || 'Sin categoría'
  const productBrand = product.marca?.descripcion || product.brand || 'Sin marca'
  const productPrice = product.precio || product.price || 0

  // Verificar si tiene oferta individual vigente
  const hasOferta = isOfertaVigente(product)
  const precioOferta = hasOferta ? product.precio_oferta! : productPrice
  const descuentoOferta = hasOferta ? product.descuento_porcentual! : 0

  // Verificar si tiene promoción con descuento válido
  const hasPromo = !!product.promo && !!product.precio_con_descuento && product.promo.descuento_porcentaje > 0

  // Debug log detallado
  if (hasOferta || hasPromo) {
    console.log('🔍 Debug de descuentos:', {
      id: product.id,
      descripcion: product.descripcion?.substring(0, 30),
      hasOferta,
      hasPromo,
      'hasOferta && hasPromo': hasOferta && hasPromo,
      promo_existe: !!product.promo,
      promo_nombre: product.promo?.nombre,
      promo_descuento: product.promo?.descuento_porcentaje,
      precio_con_descuento: product.precio_con_descuento,
      precio_oferta: product.precio_oferta,
      descuento_porcentual: product.descuento_porcentual,
      fecha_vigencia_desde: product.fecha_vigencia_desde,
      fecha_vigencia_hasta: product.fecha_vigencia_hasta
    })
  }

  // Determinar precio final: priorizar oferta individual sobre promoción
  const finalPrice = hasOferta ? precioOferta : (hasPromo ? product.precio_con_descuento! : productPrice)
  const hasDiscount = hasOferta || hasPromo
  const discountPercentage = hasOferta ? descuentoOferta : (hasPromo ? product.promo!.descuento_porcentaje : 0)

  const productUrl = product.categoria && product.categoria.descripcion && 
    !product.categoria.descripcion.toLowerCase().includes('categor') &&
    product.categoria.descripcion.trim() !== '' ? 
    `/${productCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/${product.id}` :
    `/varios/${product.id}`

  const isInFavorites = isInList(Number(product.id))
  const hasStock = product.tiene_stock === true // Solo true permite agregar, undefined/null/false no permiten
  
  // Debug: log del stock
  console.log('🔍 ProductCard - Product:', product.descripcion, 'tiene_stock:', product.tiene_stock, 'hasStock:', hasStock)
  console.log('🔍 ProductCard - Tipo de tiene_stock:', typeof product.tiene_stock)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInFavorites) {
      removeItem(Number(product.id))
    } else {
      addItem(product)
    }
  }

  return (
    <Link href={productUrl} className="block">
      <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 group cursor-pointer relative ${
        hasStock
          ? 'hover:shadow-xl hover:scale-[1.03] hover:z-50 active:scale-95'
          : 'opacity-75 grayscale-[0.3]'
      }`}>
        {/* Imagen del producto */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.imagen || product.image || '/placeholder.jpg'}
            alt={product.descripcion || product.name || 'Producto'}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {/* Icono de Favoritos - Esquina superior izquierda (solo si hay stock) */}
          {hasStock && (
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-1.5 left-1.5 p-1.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10 ${
                isInFavorites
                  ? 'bg-[#ec3036] text-white'
                  : 'bg-white/90 text-gray-600 hover:bg-white hover:text-[#ec3036]'
              }`}
              title={isInFavorites ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-all duration-300 ${
                  isInFavorites ? 'fill-current' : ''
                }`}
              />
            </button>
          )}

          {/* Badge Sin Stock - Esquina superior derecha */}
          {!hasStock && (
            <div className="absolute top-1.5 right-1.5 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold shadow-lg">
              Sin Stock
            </div>
          )}

          {/* Badge Oferta/Promoción - Esquina superior derecha (prioridad sobre destacado) */}
          {hasDiscount && hasStock && (
            <div className="absolute top-1.5 right-1.5 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Tag className="w-3 h-3" />
              -{discountPercentage}%
            </div>
          )}

          {/* Badge Destacado - Esquina superior derecha (solo si hay stock y no hay oferta/promo) */}
          {product.destacado && hasStock && !hasDiscount && (
            <div className="absolute top-1.5 right-1.5 bg-yellow-400 text-black px-1.5 py-0.5 rounded-full text-xs font-semibold shadow-lg">
              Destacado
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-2">
          {/* Marca */}
          <div className="flex gap-1 mb-1 flex-wrap">
            <span className="text-xs text-white bg-gradient-to-r from-blue-500 to-blue-600 px-1.5 py-0.5 rounded-full truncate font-semibold shadow-sm">
              {productBrand}
            </span>
          </div>

          {/* Título del producto */}
          <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
            {product.descripcion || product.name || 'Sin descripción'}
          </h3>

          {/* Precio - Siempre visible */}
          <div className="mb-2">
            {hasOferta && hasPromo && product.promo && product.precio_con_descuento ? (
              // Tiene AMBOS: oferta individual Y promoción
              <>
                {/* Precio de oferta */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-semibold text-red-600 line-through decoration-2">
                      ${formatearPrecio(productPrice)}
                    </span>
                    <span className="text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">
                      -{descuentoOferta}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${formatearPrecio(precioOferta)}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">Precio Oferta</div>
                </div>

                {/* Precio de promoción */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-orange-600 line-through decoration-2">
                      ${formatearPrecio(productPrice)}
                    </span>
                    <span className="text-xs font-bold text-white bg-orange-600 px-2 py-0.5 rounded-full">
                      -{product.promo.descuento_porcentaje}%
                    </span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    ${formatearPrecio(product.precio_con_descuento)}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">{product.promo.nombre}</div>
                </div>
              </>
            ) : hasDiscount ? (
              // Solo oferta O solo promoción
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-semibold text-red-600 line-through decoration-2">
                    ${formatearPrecio(productPrice)}
                  </span>
                  <span className="text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">
                    -{discountPercentage}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ${formatearPrecio(finalPrice)}
                </div>
              </>
            ) : (
              // Sin oferta ni promoción: precio normal
              <div className="text-xl font-bold text-blue-600">
                ${formatearPrecio(productPrice)}
              </div>
            )}
          </div>

          {/* Planes de Financiación - Versión simplificada */}
          <FinancingPlans productoId={product.id} precio={hasOferta ? precioOferta : productPrice} />

          {/* Botón Agregar a lista o selector de cantidad */}
          {!isInFavorites ? (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addItem(product)
              }}
              disabled={!hasStock}
              className={`w-full mt-2 py-1.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                !hasStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'text-white hover:opacity-90 shadow-md'
              }`}
              style={hasStock ? { backgroundColor: '#0070bb' } : {}}
            >
              {!hasStock ? (
                <>Sin Stock</>
              ) : (
                <><ShoppingCart className="w-4 h-4" /> Agregar a lista</>
              )}
            </button>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const currentQty = quantities[product.id] || 1
                  if (currentQty > 1) {
                    setQuantity(product.id, currentQty - 1)
                  }
                }}
                className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 text-center font-semibold text-sm bg-green-100 text-green-700 py-1.5 rounded-xl">
                <Check className="w-4 h-4 inline mr-1" />
                {quantities[product.id] || 1} en lista
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const currentQty = quantities[product.id] || 1
                  setQuantity(product.id, currentQty + 1)
                }}
                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
