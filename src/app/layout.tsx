'use client'

import SupabaseProvider from './components/SupabaseProvider'
import { LanguageProvider } from './components/LanguageProvider'
import { CookieConsentProvider } from './components/CookieConsentContext'
import Footer from './components/Footer'
import Script from 'next/script'
import { useMetadata } from '@/hooks/useMetadata'
import { useLanguage } from './components/LanguageProvider'
import './globals.css'

// Základné statické metadata (fallback)
export const metadata = {
  title: 'Lectio Divina - Duchovné čítanie a modlitby',
  description: 'Denné duchovné čítania, modlitby a meditácie pre hlbší duchovný život.',
  keywords: 'lectio divina, modlitby, duchovné čítanie, biblia, meditácie',
  openGraph: {
    title: 'Lectio Divina',
    description: 'Duchovné čítanie a modlitby',
    url: 'https://lectiodivina.org',
    type: 'website',
    siteName: 'Lectio Divina',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#4a5085',
}

// Komponenta pre dynamické metadata
function DynamicMetadata() {
  const { lang } = useLanguage();
  useMetadata(lang);
  return null;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Lectio Divina",
              "url": "https://lectiodivina.org",
              "description": "Denné duchovné čítania, modlitby a meditácie",
              "publisher": {
                "@type": "Organization",
                "name": "Lectio Divina"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://lectiodivina.org/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* Mobile meta tagy */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Základné meta tagy - budú sa aktualizovať dynamicky */}
        <meta name="description" content="Denné duchovné čítania, modlitby a meditácie pre hlbší duchovný život." />
        <meta name="keywords" content="lectio divina, modlitby, duchovné čítanie, biblia, meditácie" />
        
        {/* SEO meta tagy */}
        <link rel="canonical" href="https://lectiodivina.org" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="Lectio Divina" />
        <meta name="language" content="Slovak" />
        <meta name="geo.region" content="SK" />
        <meta name="geo.country" content="Slovakia" />
        
        {/* Open Graph meta tagy */}
        <meta property="og:title" content="Lectio Divina - Duchovné čítanie a modlitby" />
        <meta property="og:description" content="Duchovné čítanie a modlitby" />
        <meta property="og:url" content="https://lectiodivina.org" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Lectio Divina" />
        <meta property="og:locale" content="sk_SK" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lectio Divina - Duchovné čítanie a modlitby" />
        <meta name="twitter:description" content="Denné duchovné čítania, modlitby a meditácie" />
        
        {/* Favicon - kompletná sada */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
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
              <DynamicMetadata />
              {children}
              <Footer />
            </LanguageProvider>
          </SupabaseProvider>
        </CookieConsentProvider>
      </body>
    </html>
  )
}