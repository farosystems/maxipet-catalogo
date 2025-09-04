"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import TypewriterText from "./TypewriterText"

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section
      id="inicio"
      className="relative text-white pt-20 overflow-hidden min-h-screen flex items-center"
    >
      {/* Imagen de fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-family.svg')"
        }}
      >
        {/* Overlay mejorado para mayor calidad visual */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-purple-900/50 to-blue-900/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Fondo animado con partículas */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-float"></div>
        <div className="absolute top-32 right-20 w-6 h-6 bg-blue-300 rounded-full animate-float delay-200"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-green-400 rounded-full animate-float delay-500"></div>
        <div className="absolute bottom-40 right-1/3 w-5 h-5 bg-purple-400 rounded-full animate-float delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-15 md:py-20">
        <div className={`text-center transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Bienvenidos a<br />
            <span className="inline-block min-w-[280px] sm:min-w-[320px] md:min-w-[600px] lg:min-w-[700px]">
              <TypewriterText />
            </span>
          </h1>
          <p
            className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Tu tienda de electrodomésticos de confianza con los mejores planes de financiación
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center mt-8 md:mt-16 max-w-5xl mx-auto">
          <div className={`transition-all duration-1000 delay-700 ${isVisible ? "animate-fade-in-left" : "opacity-0"}`}>
            <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-6 md:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-300 mx-4 sm:mx-0 overflow-hidden">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 text-orange-500">¿Quiénes Somos?</h2>
              <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4 leading-relaxed text-gray-800">
                En MUNDOCUOTAS somos una empresa especializada en la venta de electrodomésticos con más de 10 años de
                experiencia en el mercado. Nos dedicamos a brindar soluciones accesibles para tu hogar.
              </p>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-800">
                Ofrecemos productos de las mejores marcas con planes de financiación flexibles que se adaptan a tu
                presupuesto.
              </p>
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-1000 ${isVisible ? "animate-fade-in-right" : "opacity-0"}`}
          >
            <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-6 md:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-300 mx-4 sm:mx-0 overflow-hidden">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 text-orange-500">¿Qué Hacemos?</h2>
              <ul className="text-sm sm:text-base md:text-lg space-y-2 sm:space-y-3 md:space-y-4">
                {[
                  "Venta de electrodomésticos de primera calidad",
                  "Planes de financiación en 3, 6, 12 y 18 cuotas",
                  "Asesoramiento personalizado",
                  "Entrega e instalación a domicilio",
                  "Garantía oficial en todos nuestros productos",
                ].map((item, index) => (
                  <li
                    key={index}
                    className={`flex items-start transition-all duration-500 text-gray-800 ${
                      index === 0
                        ? "delay-1000"
                        : index === 1
                          ? "delay-1100"
                          : index === 2
                            ? "delay-1200"
                            : index === 3
                              ? "delay-1300"
                              : "delay-1500"
                    } ${isVisible ? "animate-fade-in-left" : "opacity-0"}`}
                  >
                    <span className="text-orange-500 mr-2 sm:mr-3 text-lg sm:text-xl flex-shrink-0">✓</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Botón CTA animado */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-1000 ${isVisible ? "animate-scale-in" : "opacity-0"}`}
        >
          <Link
            href="/categorias"
            className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-5 px-10 rounded-full text-xl hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-3xl animate-pulse-glow border-2 border-yellow-300/50"
          >
            Ver Categorias
          </Link>
        </div>
      </div>
    </section>
  )
}
