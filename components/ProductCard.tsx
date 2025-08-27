"use client"

import Link from "next/link"
import { Product } from "@/lib/products"
import FinancingPlans from "./FinancingPlans"
import AddToListButton from "./AddToListButton"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const productCategory = product.categoria?.descripcion || product.category || 'Sin categoría'
  const productBrand = product.marca?.descripcion || product.brand || 'Sin marca'
  const productPrice = product.precio || product.price || 0

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.imagen || product.image || '/placeholder.jpg'}
          alt={product.descripcion || product.name || 'Producto'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge Destacado */}
        {product.destacado && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            Destacado
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        {/* Categoría y Marca */}
        <div className="flex gap-2 mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {productCategory}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {productBrand}
          </span>
        </div>

        {/* Título del producto */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.descripcion || product.name || 'Sin descripción'}
        </h3>

        {/* Descripción detallada */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.descripcion_detallada || product.description || 'Sin descripción detallada'}
        </p>

        {/* Planes de Financiación - Versión simplificada */}
        <FinancingPlans productoId={product.id} precio={productPrice} />

        {/* Botones de acción */}
        <div className="mt-3 space-y-2">
          {/* Botón Ver Detalles */}
          <Link
            href={product.categoria && product.categoria.descripcion && 
                  !product.categoria.descripcion.toLowerCase().includes('categor') &&
                  product.categoria.descripcion.trim() !== '' ? 
              `/${productCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/${product.id}` :
              `/varios/${product.id}`
            }
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300 block text-center text-sm"
          >
            Ver Detalles
          </Link>
          
          {/* Botón Agregar a Lista */}
          <AddToListButton product={product} variant="card" />
        </div>
      </div>
    </div>
  )
}
