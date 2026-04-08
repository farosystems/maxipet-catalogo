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
      <head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WC292F8P');`
        }} />
        {/* End Google Tag Manager */}
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WC292F8P"
            height="0"
            width="0"
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

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
