"use client"

import { useState } from 'react'
import { Plus, Check, Minus } from 'lucide-react'
import { useShoppingList } from '@/hooks/use-shopping-list'
import { Product } from '@/lib/products'

interface AddToListButtonProps {
  product: Product
  variant?: 'card' | 'page'
}

export default function AddToListButton({ product, variant = 'card' }: AddToListButtonProps) {
  const { addItem, isInList, quantities, setQuantity } = useShoppingList()
  const [isAdding, setIsAdding] = useState(false)
  const hasStock = product.tiene_stock === true

  const handleAddToList = () => {
    if (!hasStock) return
    setIsAdding(true)
    addItem(product)
    setTimeout(() => setIsAdding(false), 1000)
  }

  const isInShoppingList = isInList(Number(product.id))
  const quantity = quantities[product.id] || 1

  if (variant === 'card') {
    if (!isInShoppingList) {
      return (
        <button
          onClick={handleAddToList}
          disabled={isAdding || !hasStock}
          className={`w-full py-1.5 px-3 rounded-xl font-semibold transition-all duration-300 text-sm flex items-center justify-center gap-2 ${
            !hasStock
              ? 'bg-red-500 text-white cursor-not-allowed border-2 border-red-600 shadow-lg font-bold uppercase tracking-wide'
              : isAdding
              ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
              : 'text-white hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
          style={!hasStock || isAdding ? {} : { backgroundColor: '#ec3036' }}
          title={!hasStock ? 'Sin stock' : 'Agregar a lista de compra'}
        >
          {!hasStock ? (
            <>Sin Stock</>
          ) : isAdding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Agregando...
            </>
          ) : (
            <>
              <Plus size={16} />
              Agregar a lista
            </>
          )}
        </button>
      )
    }

    return (
      <div className="w-full flex items-center gap-2">
        <button
          onClick={() => quantity > 1 && setQuantity(product.id, quantity - 1)}
          className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="flex-1 text-center font-semibold text-sm bg-green-100 text-green-700 py-1.5 rounded-xl">
          <Check className="w-4 h-4 inline mr-1" />
          {quantity} en lista
        </div>
        <button
          onClick={() => setQuantity(product.id, quantity + 1)}
          className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Variante para página de producto (más grande)
  if (!isInShoppingList) {
    return (
      <button
        onClick={handleAddToList}
        disabled={isAdding || !hasStock}
        className={`w-full py-2 px-4 rounded-xl font-semibold transition-all duration-300 text-base shadow-md flex items-center justify-center gap-2 ${
          !hasStock
            ? 'bg-red-500 text-white cursor-not-allowed border-2 border-red-600 shadow-lg font-bold uppercase tracking-wide text-lg py-3'
            : isAdding
            ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
            : 'text-white hover:scale-102 hover:shadow-lg'
        }`}
        style={!hasStock || isAdding ? {} : { backgroundColor: '#ec3036' }}
        title={!hasStock ? 'Sin stock' : 'Agregar a lista de compra'}
      >
        {!hasStock ? (
          <>Sin Stock</>
        ) : isAdding ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            Agregando...
          </>
        ) : (
          <>
            <Plus size={20} />
            Agregar a lista de compra
          </>
        )}
      </button>
    )
  }

  return (
    <div className="w-full flex items-center gap-3">
      <button
        onClick={() => quantity > 1 && setQuantity(product.id, quantity - 1)}
        className="w-12 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
      >
        <Minus className="w-5 h-5" />
      </button>
      <div className="flex-1 text-center font-semibold text-base bg-green-100 text-green-700 py-2 rounded-xl">
        <Check className="w-5 h-5 inline mr-2" />
        {quantity} en tu lista
      </div>
      <button
        onClick={() => setQuantity(product.id, quantity + 1)}
        className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  )
}
