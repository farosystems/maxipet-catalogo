import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ShoppingListProvider } from "@/hooks/use-shopping-list"
import { ConfiguracionWebProvider } from "@/contexts/ConfiguracionWebContext"
import GlobalStyles from "@/components/GlobalStyles"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MaxiPet - Alimento para Perros y Gatos",
  description:
    "Tu tienda de alimento para perros y gatos de confianza con los mejores planes de financiación. Alimento premium, snacks, accesorios y más.",
  keywords: "alimento para perros, alimento para gatos, mascotas, cuotas, financiación, premium, snacks",
  generator: 'v0.dev',
  icons: {
    icon: '/LOGO2.png',
  },
  metadataBase: new URL('https://maxipet-catalogo-zkz9.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName: 'MaxiPet',
    title: 'MaxiPet - Alimento para Perros y Gatos',
    description: 'Tu tienda de alimento para perros y gatos de confianza con los mejores planes de financiación. Alimento premium, snacks, accesorios y más.',
    images: [
      {
        url: '/LOGO2.png?v=2',
        width: 400,
        height: 200,
        alt: 'MaxiPet - Alimento para Perros y Gatos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaxiPet - Alimento para Perros y Gatos',
    description: 'Tu tienda de alimento para perros y gatos de confianza con los mejores planes de financiación. Alimento premium, snacks, accesorios y más.',
    images: ['/LOGO2.png?v=2'],
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
