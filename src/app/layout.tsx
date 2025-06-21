// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from './components/LanguageProvider'
import CookieConsentProvider from './components/CookieConsentProvider'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: 'Lectio Divina | Mobilná aplikácia pre duchovný rast',
  description: 'Objavte duchovnú cestu cez Lectio Divina. Mobilná aplikácia pre denné čítanie, meditáciu a modlitbu.',
  keywords: 'lectio divina, modlitba, biblia, duchovnosť, meditácia',
  authors: [{ name: 'KROK - Pastoračný fond Žilinskej diecézy' }],
  creator: 'MYPROFILE',
  publisher: 'KROK',
  robots: 'index, follow',
  openGraph: {
    title: 'Lectio Divina | Mobilná aplikácia',
    description: 'Duchovná aplikácia pre každý deň',
    url: 'https://lectiodivina.org',
    siteName: 'Lectio Divina',
    images: [
      {
        url: 'https://lectiodivina.org/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lectio Divina App',
      },
    ],
    locale: 'sk_SK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lectio Divina | Mobilná aplikácia',
    description: 'Duchovná aplikácia pre každý deň',
    images: ['https://lectiodivina.org/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4a5085',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://lectiodivina.org" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#4a5085" />
        <meta name="theme-color" content="#4a5085" />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <LanguageProvider>
          <CookieConsentProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </CookieConsentProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}