import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ShoppingListProvider } from "@/hooks/use-shopping-list"
import { ConfiguracionWebProvider } from "@/contexts/ConfiguracionWebContext"
import GlobalStyles from "@/components/GlobalStyles"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MaxiPet - Electrodomésticos en Cuotas",
  description:
    "Tu tienda de electrodomésticos de confianza con los mejores planes de financiación. Heladeras, lavarropas, aires acondicionados y más.",
  keywords: "electrodomésticos, cuotas, financiación, heladeras, lavarropas, aires acondicionados",
  generator: 'v0.dev',
  icons: {
    icon: '/LOGO2.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://www.mundocuota.com.ar',
    siteName: 'MaxiPet',
    title: 'MaxiPet - Electrodomésticos en Cuotas',
    description: 'Tu tienda de electrodomésticos de confianza con los mejores planes de financiación. Heladeras, lavarropas, aires acondicionados y más.',
    images: [
      {
        url: 'https://www.mundocuota.com.ar/LOGO2.png?v=5',
        width: 400,
        height: 200,
        alt: 'MaxiPet - Electrodomésticos en Cuotas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaxiPet - Electrodomésticos en Cuotas',
    description: 'Tu tienda de electrodomésticos de confianza con los mejores planes de financiación. Heladeras, lavarropas, aires acondicionados y más.',
    images: ['https://www.mundocuota.com.ar/LOGO2.png?v=5'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ConfiguracionWebProvider>
          <GlobalStyles />
          <ShoppingListProvider>
            {children}
          </ShoppingListProvider>
        </ConfiguracionWebProvider>
      </body>
    </html>
  )
}
