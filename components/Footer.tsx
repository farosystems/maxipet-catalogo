'use client'

import Link from "next/link"
import { Home, Package, Zap, Shield, CreditCard, Truck } from "lucide-react"
import { useConfiguracionWebContext } from '@/contexts/ConfiguracionWebContext'
import { useIsMobile } from '@/hooks/use-mobile'

export default function Footer() {
  const { configuracion } = useConfiguracionWebContext()
  const isMobile = useIsMobile()
  
  const scrollToProducts = () => {
    const productsSection = document.getElementById('productos')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const getLogoSize = () => {
    if (!configuracion) return { width: isMobile ? 40 : 48, height: isMobile ? 30 : 36 }
    const baseWidth = isMobile ? configuracion.mobile_logo_width : configuracion.logo_width
    const baseHeight = isMobile ? configuracion.mobile_logo_height : configuracion.logo_height
    
    // Reducimos el tamaño para el footer (aproximadamente 25% del tamaño original)
    return {
      width: Math.round(baseWidth * 0.25),
      height: Math.round(baseHeight * 0.25)
    }
  }

  return (
    <footer style={{ background: 'linear-gradient(to right, #005a8d, #0070bb, #005a8d)' }} className="text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Contenido principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">

          {/* Columna 1: MaxiPet */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {configuracion?.logo_url ? (
                <img
                  src={configuracion.logo_url}
                  alt="Logo"
                  style={{
                    width: `${getLogoSize().width}px`,
                    height: `${getLogoSize().height}px`,
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <img
                  src="/LOGO2.png"
                  alt="MaxiPet"
                  className="h-12 w-auto"
                />
              )}
              <div>
                <h3 className="text-xl font-bold">MaxiPet</h3>
                <p className="text-blue-200 text-sm">Tu tienda de alimento para perros y gatos de confianza</p>
              </div>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Especialistas en alimento para perros y gatos con los mejores planes de financiación.
              Hacemos que tus sueños sean realidad con cuotas accesibles.
            </p>
          </div>

          {/* Columna 2: Productos */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-blue-400 pb-2">Productos</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={scrollToProducts}
                  className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center"
                >
                  <Package className="mr-2 size-4" />
                  Catálogo completo
                </button>
              </li>
              <li>
                <Link href="/#destacados" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center">
                  <Zap className="mr-2 size-4" />
                  Productos destacados
                </Link>
              </li>
              <li className="text-blue-200 flex items-center">
                <Truck className="mr-2 size-4" />
                Envío a domicilio
              </li>
              <li className="text-blue-200 flex items-center">
                <CreditCard className="mr-2 size-4" />
                Financiación en cuotas
              </li>
            </ul>
          </div>

          {/* Columna 3: Soporte */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-blue-400 pb-2">Soporte</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/ayuda" className="text-blue-200 hover:text-white transition-colors duration-300">
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-blue-200 hover:text-white transition-colors duration-300">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-blue-200 hover:text-white transition-colors duration-300">
                  Política de privacidad
                </Link>
              </li>
              <li className="text-blue-200 flex items-center">
                <Shield className="mr-2 size-4" />
                Garantía extendida
              </li>
            </ul>
          </div>

        </div>

        {/* Línea separadora */}
        <div className="border-t border-blue-400 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-200 text-sm text-center md:text-left">
              © 2025 MaxiPet. Todos los derechos reservados.
              Especialistas en alimento para perros y gatos con financiación.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-200 hover:text-white transition-colors duration-300 text-sm">
                Inicio
              </Link>
              <button
                onClick={scrollToProducts}
                className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
              >
                Productos
              </button>
              <Link href="/#destacados" className="text-blue-200 hover:text-white transition-colors duration-300 text-sm">
                Destacados
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 