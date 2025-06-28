import SupabaseProvider from './components/SupabaseProvider'
import { LanguageProvider } from './components/LanguageProvider'
import { CookieConsentProvider } from './components/CookieConsentContext'
import Footer from './components/Footer'
import Script from 'next/script'
import './globals.css'

export const metadata = {
  title: 'Lectio Divina',
  description: 'Duchovná aplikácia pre Lectio Divina',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Umami Analytics */}
        <Script
          src="https://analytics.lectiodivina.org/script.js"
          data-website-id="c7311d25-b9b7-4c15-9d15-333962066cdb"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-white text-black" suppressHydrationWarning>
        <CookieConsentProvider>
          <SupabaseProvider session={null}>
            <LanguageProvider>
              {children}
              <Footer />
            </LanguageProvider>
          </SupabaseProvider>
        </CookieConsentProvider>
      </body>
    </html>
  )
}