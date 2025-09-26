'use client'

import Link from "next/link"
import { Menu, ShoppingBag, X, Home, Star } from "lucide-react"
import ProductSearch from "./ProductSearch"
import CategoriesDropdown from "./CategoriesDropdown"
import ShoppingListModal from "./ShoppingListModal"
import { useState, useEffect } from "react"
import { useShoppingList } from "@/hooks/use-shopping-list"
import { useConfiguracionWebContext } from '@/contexts/ConfiguracionWebContext'
import { useIsMobile } from '@/hooks/use-mobile'

export default function GlobalAppBar() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false)
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { itemCount } = useShoppingList()
  const { configuracion } = useConfiguracionWebContext()
  const isMobile = useIsMobile()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getLogoSize = () => {
    if (!configuracion) return { width: isMobile ? 150 : 200, height: isMobile ? 45 : 60 }
    return {
      width: isMobile ? configuracion.mobile_logo_width : configuracion.logo_width,
      height: isMobile ? configuracion.mobile_logo_height : configuracion.logo_height
    }
  }

  // Cerrar menú móvil al cambiar el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const scrollToProducts = () => {
    const productsSection = document.getElementById('productos')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const getAppBarStyle = () => {
    if (!configuracion) return {}
    return {
      backgroundColor: configuracion.appbar_background_color,
      borderBottomColor: configuracion.primary_color
    }
  }

  const getTextColor = () => {
    if (!configuracion) return "#ffffff"
    return configuracion.appbar_text_color
  }

  return (
    <>
      <div 
        className="sticky top-0 z-50 shadow-lg border-b"
        style={getAppBarStyle()}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header principal */}
          <div className="flex items-center justify-between py-3 lg:py-4">
            {/* Logo - responsive */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  {!isClient ? (
                    // Durante la carga inicial, usar tamaño seguro
                    <img
                      src="/LOGO2.png"
                      alt="MUNDO CUOTA"
                      className="h-12 sm:h-16 w-auto transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : isMobile ? (
                    <img
                      src="/LOGO2.png"
                      alt="MUNDO CUOTA"
                      className="h-24 sm:h-28 w-auto transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : configuracion?.logo_url ? (
                    <img
                      src={configuracion.logo_url}
                      alt="Logo"
                      style={{
                        width: `${getLogoSize().width}px`,
                        height: `${getLogoSize().height}px`,
                        objectFit: 'contain'
                      }}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src="/LOGO2.png"
                      alt="MUNDO CUOTA"
                      className="lg:h-36 xl:h-40 w-auto transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-violet-400 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
                </div>
                <div className="ml-1 sm:ml-2 hidden sm:block">
                  <h1 
                    className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold tracking-wide transition-colors duration-300"
                    style={{ color: getTextColor() }}
                  >
                    MUNDO CUOTA
                  </h1>
                  <p 
                    className="text-xs font-medium opacity-75 hidden sm:block"
                    style={{ color: getTextColor() }}
                  >
                    Tu tienda de confianza
                  </p>
                </div>
              </Link>
            </div>

            {/* Buscador móvil/tablet en header principal */}
            <div className="flex-1 max-w-5xl mx-2 mr-4 lg:hidden">
              <ProductSearch />
            </div>

            {/* Buscador desktop */}
            <div className="flex-1 max-w-4xl mx-4 hidden lg:block">
              <ProductSearch />
            </div>

            {/* Controles de la derecha - solo en móvil */}
            <div className="flex items-center space-x-2 sm:space-x-4 lg:hidden">
              {/* Indicador de estado - oculto en móvil */}
              <div
                className="hidden sm:flex items-center space-x-2 rounded-full px-2 sm:px-3 py-1 backdrop-blur-sm opacity-30"
                style={{ backgroundColor: configuracion?.primary_color || "#0066cc" }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span 
                  className="text-xs font-medium opacity-75"
                  style={{ color: getTextColor() }}
                >
                  En línea
                </span>
              </div>
              
              {/* Botón hamburguesa */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="hover:opacity-70 transition-colors duration-300 p-2 rounded-full text-white"
                style={{
                  backgroundColor: configuracion?.primary_color || "#0066cc"
                }}
                aria-label="Abrir menú"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Navegación desktop */}
          <div className="hidden lg:flex items-center justify-between py-3 border-t border-violet-800/30 px-6">
            {/* Categorías */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button className="text-white hover:text-violet-200 transition-colors duration-300 font-bold text-lg flex items-center">
                <Menu className="mr-2 size-6" />
                Categorías
              </button>
              
              <div className="absolute top-full left-0 pt-2">
                <CategoriesDropdown 
                  isOpen={isCategoriesOpen}
                  onClose={() => setIsCategoriesOpen(false)}
                  isMobile={false}
                />
              </div>
            </div>
            
            {/* Navegación central */}
            <nav className="flex items-center space-x-95">
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
            
            {/* Mi Lista a la derecha - desktop */}
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

        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-violet-800/95 backdrop-blur-sm border-t border-violet-700">
            <div className="px-4 py-4 space-y-1">
              {/* Navegación principal */}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 text-white hover:bg-violet-700/50 rounded-lg transition-colors font-medium"
              >
                <Home className="mr-3" size={20} />
                Inicio
              </Link>
              
              <Link
                href="/#destacados"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 text-white hover:bg-violet-700/50 rounded-lg transition-colors font-medium"
              >
                <Star className="mr-3" size={20} />
                Destacados
              </Link>
              
              {/* Mi Lista móvil */}
              <button
                onClick={() => {
                  setIsShoppingListOpen(true)
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center px-4 py-3 text-white hover:bg-violet-700/50 rounded-lg transition-colors font-medium"
              >
                <ShoppingBag className="mr-3" size={20} />
                Mi Lista ({itemCount})
              </button>
              
              {/* Categorías móvil */}
              <button
                onClick={() => {
                  setIsMobileCategoriesOpen(true)
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center w-full px-4 py-3 text-white hover:bg-violet-700/50 rounded-lg transition-colors font-medium"
              >
                <div className="flex items-center">
                  <Menu className="mr-3" size={20} />
                  Categorías
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de Mi Lista */}
      <ShoppingListModal 
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
      />
      
      {/* Categories Dropdown - Mobile Full Screen */}
      <CategoriesDropdown 
        isOpen={isMobileCategoriesOpen}
        onClose={() => setIsMobileCategoriesOpen(false)}
        isMobile={true}
      />
    </>
  )
} 