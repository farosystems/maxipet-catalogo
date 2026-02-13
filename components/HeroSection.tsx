"use client"

import { useEffect, useState } from "react"
import TypewriterText from "./TypewriterText"

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section
      id="inicio"
      className="relative text-white pt-12 overflow-hidden h-[30vh] min-h-[250px] sm:h-[35vh] sm:min-h-[300px] flex items-center"
    >
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-family.webp')"
        }}
      >
        {/* Overlay mejorado para mayor calidad visual */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0, 112, 187, 0.7), rgba(0, 90, 141, 0.6), rgba(0, 112, 187, 0.7))' }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Fondo animado con partículas */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-float"></div>
        <div className="absolute top-32 right-20 w-6 h-6 bg-blue-300 rounded-full animate-float delay-200"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-float delay-500"></div>
        <div className="absolute bottom-40 right-1/3 w-5 h-5 bg-blue-400 rounded-full animate-float delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 md:py-6">
        <div className={`text-center transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 leading-tight">
            Bienvenidos a<br />
            <span className="inline-block min-w-[200px] sm:min-w-[240px] md:min-w-[350px] lg:min-w-[420px]">
              <TypewriterText />
            </span>
          </h1>
          <p
            className={`text-sm md:text-base lg:text-lg mb-3 max-w-2xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Tu tienda de alimento para perros y gatos de confianza con los mejores planes de financiación
          </p>
        </div>

      </div>
    </section>
  )
}
