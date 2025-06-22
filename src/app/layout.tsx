import { createClient } from '@/app/lib/supabase/server' // Aktuálna cesta
import SupabaseProvider from './components/SupabaseProvider'
import { LanguageProvider } from './components/LanguageProvider'
import { CookieConsentProvider } from './components/CookieConsentContext'; 
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
  const supabase = await createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

   return (
    <html lang="sk">
      <body>
        <SupabaseProvider session={session}>
          <LanguageProvider>
            <CookieConsentProvider>
              {children}
            </CookieConsentProvider>
          </LanguageProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
