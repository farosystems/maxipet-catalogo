import FeaturedSection from "@/components/FeaturedSection"
import Promo12CuotasSection from "@/components/Promo12CuotasSection"
import CombosSection from "@/components/CombosSection"
import GlobalAppBar from "@/components/GlobalAppBar"
import Footer from "@/components/Footer"
import { getMostrarCombos } from "@/lib/supabase-config"

export default async function Home() {
  const mostrarCombos = await getMostrarCombos()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <GlobalAppBar />

      <main>
        <FeaturedSection />
        <Promo12CuotasSection />
        {mostrarCombos && <CombosSection />}
      </main>

      <Footer />
    </div>
  )
}
