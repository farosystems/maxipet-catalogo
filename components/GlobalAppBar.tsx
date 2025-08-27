'use client'

import Link from "next/link"
import { Menu, ShoppingBag } from "lucide-react"
import ProductSearch from "./ProductSearch"
import CategoriesDropdown from "./CategoriesDropdown"
import ShoppingListModal from "./ShoppingListModal"
import { useState } from "react"
import { useShoppingList } from "@/hooks/use-shopping-list"

export default function GlobalAppBar() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false)
  const { itemCount } = useShoppingList()
  
  const scrollToProducts = () => {
    const productsSection = document.getElementById('productos')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-violet-700 via-violet-600 to-violet-700 shadow-lg border-b border-violet-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header principal */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <img 
                  src="/logo.svg" 
                  alt="MUNDO CUOTAS" 
                  className="h-28 w-auto transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-violet-400 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-white tracking-wide group-hover:text-violet-200 transition-colors duration-300">
                  MUNDOCUOTAS
                </h1>
                <p className="text-xs text-violet-200 font-medium">Tu tienda de confianza</p>
              </div>
            </Link>
          </div>

          {/* Buscador central - mucho más largo */}
          <div className="flex-1 max-w-4xl mx-4 hidden lg:block">
            <ProductSearch />
          </div>

          {/* Indicador de estado */}
          <div className="flex items-center space-x-2 bg-violet-800/30 rounded-full px-3 py-1 backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-violet-200 text-xs font-medium">En línea</span>
          </div>
        </div>

        {/* Navegación secundaria - estilo horizontal simple */}
        <div className="flex items-center justify-between py-3 border-t border-violet-800/30 px-6">
          {/* Categorías a la izquierda */}
          <div 
            className="relative"
            onMouseEnter={() => setIsCategoriesOpen(true)}
            onMouseLeave={() => setIsCategoriesOpen(false)}
          >
            <button
              className="text-white hover:text-violet-200 transition-colors duration-300 font-bold text-lg flex items-center"
            >
              <Menu className="mr-2 size-6" />
              Categorías
            </button>
            
            <CategoriesDropdown 
              isOpen={isCategoriesOpen}
              onClose={() => setIsCategoriesOpen(false)}
            />
          </div>
          
          {/* Navegación centrada */}
          <nav className="flex items-center space-x-12">
            <Link 
              href="/" 
              className="text-white hover:text-violet-200 transition-colors duration-300 font-bold text-lg underline underline-offset-4"
            >
              Inicio
            </Link>
            
            <Link 
              href="/#destacados" 
              className="text-white hover:text-violet-200 transition-colors duration-300 font-bold text-lg"
            >
              Destacados
            </Link>
          </nav>
          
          {/* Mi Lista a la derecha */}
          <div className="flex items-center">
            <button
              onClick={() => setIsShoppingListOpen(true)}
              className="text-white hover:text-violet-200 transition-colors duration-300 font-bold text-lg flex items-center gap-2"
              title="Mi Lista de Compra"
            >
              <ShoppingBag size={20} />
              Mi Lista ({itemCount})
            </button>
          </div>
        </div>

        {/* Buscador móvil */}
        <div className="lg:hidden pb-4">
          <ProductSearch />
        </div>
      </div>
      
      {/* Modal de Mi Lista */}
      <ShoppingListModal 
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
      />
    </div>
  )
} 