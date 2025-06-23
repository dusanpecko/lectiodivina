// ============================================
// src/app/layout.tsx - OPRAVENÝ PRE SAFARI A MOBILNÉ ZARIADENIA
// ============================================
import { createClient } from '@/app/lib/supabase/server'
import SupabaseProvider from './components/SupabaseProvider'
import { LanguageProvider } from './components/LanguageProvider'
import { CookieConsentProvider } from './components/CookieConsentContext'
import Footer from './components/Footer'
import './globals.css'

export const metadata = {
  title: 'Lectio Divina',
  description: 'Duchovná aplikácia pre Lectio Divina',
  // Pridané pre lepšiu kompatibilitu
  viewport: 'width=device-width, initial-scale=1',
  charset: 'utf-8',
  // Pre Safari a mobilné zariadenia
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
  // Pre lepšie SEO a kompatibilitu
  robots: 'index, follow',
  themeColor: '#ffffff',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  
  try {
    // Safer approach pre Safari
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
        {/* Explicitne pridané meta tagy pre Safari */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
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