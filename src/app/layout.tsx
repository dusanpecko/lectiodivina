// ============================================
// src/app/layout.tsx - AKTUALIZOVANÝ
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
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ OPRAVENÉ - await je späť lebo server.ts je async
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="sk">
      <body>
        <CookieConsentProvider>
          <SupabaseProvider session={session}>
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