// src/app/layout.tsx
import SupabaseProvider from './components/SupabaseProvider'
import { LanguageProvider } from './components/LanguageProvider'
import { CookieConsentProvider } from './components/CookieConsentContext'
import Footer from './components/Footer'
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
