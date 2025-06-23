// ============================================
// src/app/layout.tsx - OPRAVENÝ PRE HYDRATION ISSUES
// ============================================
import { createClient } from '@/app/lib/supabase/server'
import SupabaseProvider from './components/SupabaseProvider'
import { LanguageProvider } from './components/LanguageProvider'
import { CookieConsentProvider } from './components/CookieConsentContext'
import Footer from './components/Footer'
import './globals.css'

// Opravené metadata - bez viewport a themeColor (budú v viewport export)
export const metadata = {
  title: 'Lectio Divina',
  description: 'Duchovná aplikácia pre Lectio Divina',
  charset: 'utf-8',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
  robots: 'index, follow',
}

// Viewport export (Next.js 14+ odporúčanie)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  
  try {
    const supabase = await createClient()
    const {
      data: { session: userSession },
    } = await supabase.auth.getSession()
    session = userSession
  } catch (error) {
    console.error('Error getting session:', error)
    // Pokračuj bez session ak sa niečo pokazí
  }

  return (
    <html lang="sk">
      <head>
        {/* Minimálne meta tagy - ostatné sa pridajú cez metadata/viewport export */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body suppressHydrationWarning={true}>
        <CookieConsentProvider>
          <SupabaseProvider session={session}>
            <LanguageProvider>
              <div id="root">
                {children}
                <Footer />
              </div>
            </LanguageProvider>
          </SupabaseProvider>
        </CookieConsentProvider>
      </body>
    </html>
  )
}