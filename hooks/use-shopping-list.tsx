"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/lib/products'

export interface PlanSeleccionado {
  planId: number
  nombre: string
  cuotas: number
  cuotaMensual: number
}

interface ShoppingListContextType {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  clearList: () => void
  isInList: (productId: number) => boolean
  itemCount: number
  selectedPlans: Record<string, PlanSeleccionado>
  setSelectedPlan: (productId: string, plan: PlanSeleccionado | null) => void
  quantities: Record<string, number>
  setQuantity: (productId: string, quantity: number) => void
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined)

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [selectedPlans, setSelectedPlans] = useState<Record<string, PlanSeleccionado>>({})
  const [quantities, setQuantities] = useState<Record<string, number>>({})

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
    const savedPlans = localStorage.getItem('shopping-list-plans')
    if (savedPlans) {
      try {
        setSelectedPlans(JSON.parse(savedPlans))
      } catch (error) {
        localStorage.removeItem('shopping-list-plans')
      }
    }
    const savedQuantities = localStorage.getItem('shopping-list-quantities')
    if (savedQuantities) {
      try {
        setQuantities(JSON.parse(savedQuantities))
      } catch (error) {
        localStorage.removeItem('shopping-list-quantities')
      }
    }
  }, [])

  // Guardar lista en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('shopping-list', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem('shopping-list-plans', JSON.stringify(selectedPlans))
  }, [selectedPlans])

  useEffect(() => {
    localStorage.setItem('shopping-list-quantities', JSON.stringify(quantities))
  }, [quantities])

  const addItem = (product: Product) => {
    setItems(prev => {
      if (prev.some(item => item.id === product.id)) {
        return prev
      }
      return [...prev, product]
    })
    // Initialize quantity to 1 when adding
    if (!quantities[String(product.id)]) {
      setQuantities(prev => ({ ...prev, [String(product.id)]: 1 }))
    }
  }

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(item => String(item.id) !== String(productId)))
    // Clean up selected plan and quantity when product is removed
    setSelectedPlans(prev => {
      const next = { ...prev }
      delete next[String(productId)]
      return next
    })
    setQuantities(prev => {
      const next = { ...prev }
      delete next[String(productId)]
      return next
    })
  }

  const clearList = () => {
    setItems([])
    setSelectedPlans({})
    setQuantities({})
  }

  const isInList = (productId: number) => {
    return items.some(item => String(item.id) === String(productId))
  }

  const setSelectedPlan = (productId: string, plan: PlanSeleccionado | null) => {
    setSelectedPlans(prev => {
      const next = { ...prev }
      if (plan) {
        next[productId] = plan
      } else {
        delete next[productId]
      }
      return next
    })
  }

  const setQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setQuantities(prev => ({ ...prev, [productId]: quantity }))
  }

  const itemCount = items.length

  return (
    <ShoppingListContext.Provider value={{
      items,
      addItem,
      removeItem,
      clearList,
      isInList,
      itemCount,
      selectedPlans,
      setSelectedPlan,
      quantities,
      setQuantity
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
