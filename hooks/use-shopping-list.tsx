"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/lib/products'

interface ShoppingListContextType {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  clearList: () => void
  isInList: (productId: number) => boolean
  itemCount: number
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined)

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])

  // Cargar lista desde localStorage al inicializar
  useEffect(() => {
    const savedList = localStorage.getItem('shopping-list')
    if (savedList) {
      try {
        setItems(JSON.parse(savedList))
      } catch (error) {
        console.error('Error loading shopping list:', error)
        localStorage.removeItem('shopping-list')
      }
    }
  }, [])

  // Guardar lista en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('shopping-list', JSON.stringify(items))
  }, [items])

  const addItem = (product: Product) => {
    setItems(prev => {
      // Evitar duplicados
      if (prev.some(item => item.id === product.id)) {
        return prev
      }
      return [...prev, product]
    })
  }

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }

  const clearList = () => {
    setItems([])
  }

  const isInList = (productId: number) => {
    return items.some(item => item.id === productId)
  }

  const itemCount = items.length

  return (
    <ShoppingListContext.Provider value={{
      items,
      addItem,
      removeItem,
      clearList,
      isInList,
      itemCount
    }}>
      {children}
    </ShoppingListContext.Provider>
  )
}

export function useShoppingList() {
  const context = useContext(ShoppingListContext)
  if (context === undefined) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider')
  }
  return context
}
