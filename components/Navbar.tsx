"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { useConfiguracionWebContext } from '@/contexts/ConfiguracionWebContext'
import { useIsMobile } from '@/hooks/use-mobile'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { configuracion, loading, error } = useConfiguracionWebContext()
  const isMobile = useIsMobile()


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsOpen(false)
  }

  const getLogoSize = () => {
    if (!configuracion) return { width: isMobile ? 150 : 200, height: isMobile ? 45 : 60 }
    return {
      width: isMobile ? configuracion.mobile_logo_width : configuracion.logo_width,
      height: isMobile ? configuracion.mobile_logo_height : configuracion.logo_height
    }
  }

  const getAppBarHeight = () => {
    if (!configuracion) return isMobile ? 56 : 64
    return isMobile ? configuracion.mobile_appbar_height : configuracion.appbar_height
  }

  const getAppBarStyle = () => {
    if (!configuracion) return {}
    return {
      backgroundColor: configuracion.appbar_background_color,
      color: configuracion.appbar_text_color,
      height: `${getAppBarHeight()}px`
    }
  }

  const logoSize = getLogoSize()

  // Mostrar estado de carga
  if (loading) {
    return (
      <nav className="fixed w-full z-50 bg-gray-800 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-white">Cargando configuración...</span>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-md shadow-lg" : ""
      }`}
      style={getAppBarStyle()}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center" style={{ height: `${getAppBarHeight()}px` }}>
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center transition-colors duration-300"
            >
              {configuracion?.logo_url ? (
                <img
                  src={configuracion.logo_url}
                  alt="Logo"
                  style={{
                    width: `${logoSize.width}px`,
                    height: `${logoSize.height}px`,
                    objectFit: 'contain'
                  }}
                  className="transition-all duration-300"
                />
              ) : (
                <span
                  className="text-2xl font-bold transition-colors duration-300 animate-pulse-glow"
                  style={{ color: configuracion?.appbar_text_color || "#ffffff" }}
                >
                  MaxiPet
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {["inicio", "productos", "destacados"].map((section, index) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`capitalize hover:opacity-70 transition-all duration-300 transform hover:scale-105 animate-fade-in-up ${
                  index === 0 ? "delay-100" : index === 1 ? "delay-200" : "delay-300"
                }`}
                style={{ color: configuracion?.appbar_text_color || "#ffffff" }}
              >
                {section}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hover:opacity-70 transition-all duration-300 transform hover:scale-110"
              style={{ color: configuracion?.appbar_text_color || "#ffffff" }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div 
            className="px-2 pt-2 pb-3 space-y-1 sm:px-3 backdrop-blur-md rounded-b-lg"
            style={{ backgroundColor: configuracion?.appbar_background_color || "#1e40af" }}
          >
            {["inicio", "productos", "destacados"].map((section, index) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`block px-3 py-2 hover:opacity-70 w-full text-left capitalize transition-all duration-300 transform hover:translate-x-2 animate-fade-in-left ${
                  index === 0 ? "delay-100" : index === 1 ? "delay-200" : "delay-300"
                }`}
                style={{ color: configuracion?.appbar_text_color || "#ffffff" }}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
