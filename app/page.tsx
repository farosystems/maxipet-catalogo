import HeroSection from "@/components/HeroSection"
import FeaturedSection from "@/components/FeaturedSection"
import GlobalAppBar from "@/components/GlobalAppBar"
import Footer from "@/components/Footer"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <GlobalAppBar />
      
      <main>
        <HeroSection />
        <FeaturedSection />
        
        {/* Sección Call to Action para ver todos los productos */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Buscás algo específico?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Explorá nuestro catálogo completo con más de 200 productos
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/cocinas"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-violet-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Cocinas
              </Link>
              <Link
                href="/tv-audio"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                TV y Audio
              </Link>
              <Link
                href="/electrodomesticos"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Electrodomésticos
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
