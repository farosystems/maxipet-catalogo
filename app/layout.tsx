import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ShoppingListProvider } from "@/hooks/use-shopping-list"
import { ConfiguracionWebProvider } from "@/contexts/ConfiguracionWebContext"
import GlobalStyles from "@/components/GlobalStyles"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MUNDOCUOTAS - Electrodomésticos en Cuotas",
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
    url: 'https://catalogo-mundocuotas.vercel.app',
    siteName: 'MUNDOCUOTAS',
    title: 'MUNDOCUOTAS - Electrodomésticos en Cuotas',
    description: 'Tu tienda de electrodomésticos de confianza con los mejores planes de financiación. Heladeras, lavarropas, aires acondicionados y más.',
    images: [
      {
        url: '/logo1.svg',
        width: 1200,
        height: 630,
        alt: 'MUNDOCUOTAS - Electrodomésticos en Cuotas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MUNDOCUOTAS - Electrodomésticos en Cuotas',
    description: 'Tu tienda de electrodomésticos de confianza con los mejores planes de financiación. Heladeras, lavarropas, aires acondicionados y más.',
    images: ['/logo.png'],
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
