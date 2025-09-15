"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Package } from "lucide-react"
import { ComboProducto } from "@/lib/products"
import { useShoppingList } from "@/hooks/use-shopping-list"

interface ComboProductsSectionProps {
  productos: ComboProducto[]
}

export default function ComboProductsSection({ productos }: ComboProductsSectionProps) {
  const { addItem, removeItem, isInList } = useShoppingList()

  if (!productos || productos.length === 0) {
    return null
  }

  const handleFavoriteClick = (e: React.MouseEvent, producto: ComboProducto) => {
    e.preventDefault()
    e.stopPropagation()

    const productForList = {
      id: producto.producto_id.toString(),
      descripcion: producto.producto.descripcion,
      precio: producto.producto.precio,
      imagen: producto.producto.imagen || '/placeholder.jpg',
      fk_id_categoria: producto.producto.fk_id_categoria,
      fk_id_marca: producto.producto.fk_id_marca,
      destacado: producto.producto.destacado,
      tiene_stock: producto.producto.tiene_stock,
      descripcion_detallada: producto.producto.descripcion_detallada,
      stock: producto.producto.stock
    }

    const isInFavorites = isInList(producto.producto_id)

    if (isInFavorites) {
      removeItem(producto.producto_id)
    } else {
      addItem(productForList)
    }
  }

  return (
    <section className="mt-16 mb-16">
      <div className="text-center mb-12">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
          Productos que forman este combo
        </h2>
        <p className="text-xs md:text-sm text-gray-600">
          Estos son los productos incluidos en esta oferta especial
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Carrusel para móviles */}
      <div className="md:hidden">
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 px-4">
            {productos.map((comboProducto, index) => (
              <div
                key={`mobile-${comboProducto.producto_id}-${index}`}
                className="flex-shrink-0 w-64"
              >
                <ProductCard
                  producto={comboProducto.producto}
                  cantidad={comboProducto.cantidad}
                  onFavoriteClick={(e) => handleFavoriteClick(e, comboProducto)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid para desktop */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map((comboProducto, index) => (
            <div
              key={`desktop-${comboProducto.producto_id}-${index}`}
              className={`transition-all duration-700 ${
                index === 0
                  ? "delay-100 animate-fade-in-up"
                  : index === 1
                    ? "delay-200 animate-fade-in-up"
                    : index === 2
                      ? "delay-300 animate-fade-in-up"
                      : "delay-400 animate-fade-in-up"
              }`}
            >
              <ProductCard
                producto={comboProducto.producto}
                cantidad={comboProducto.cantidad}
                onFavoriteClick={(e) => handleFavoriteClick(e, comboProducto)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

interface ProductCardProps {
  producto: any
  cantidad: number
  onFavoriteClick: (e: React.MouseEvent) => void
}

function ProductCard({ producto, cantidad, onFavoriteClick }: ProductCardProps) {
  const { isInList } = useShoppingList()
  const isInFavorites = isInList(producto.id)
  const productUrl = `/productos/${producto.id}`

  return (
    <Link href={productUrl} className="block">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 group cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95">
        {/* Imagen del producto */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={producto.imagen || '/placeholder.jpg'}
            alt={producto.descripcion}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badge de cantidad */}
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
            x{cantidad}
          </div>

          {/* Icono de Favoritos */}
          <button
            onClick={onFavoriteClick}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10 ${
              isInFavorites
                ? 'bg-violet-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-violet-500'
            }`}
            title={isInFavorites ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                isInFavorites ? 'fill-current' : ''
              }`}
            />
          </button>
        </div>

        {/* Información del producto */}
        <div className="p-2 sm:p-3">
          {/* Título del producto */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2">
            {producto.descripcion}
          </h3>

          {/* Precio */}
          <div className="mb-2">
            <p className="text-lg font-bold text-violet-600">
              ${producto.precio.toLocaleString()}
            </p>
            {cantidad > 1 && (
              <p className="text-xs text-gray-500">
                Total: ${(producto.precio * cantidad).toLocaleString()}
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              producto.tiene_stock ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-600">
              {producto.tiene_stock ? 'En stock' : 'Sin stock'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}