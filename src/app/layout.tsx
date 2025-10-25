'use client'

import { useMetadata } from '@/hooks/useMetadata'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import packageJson from '../../package.json'
import BetaFloatingIcon from './components/BetaFloatingIcon'
import { CookieConsentProvider } from './components/CookieConsentContext'
import Footer from './components/Footer'
import { LanguageProvider, useLanguage } from './components/LanguageProvider'
import ScrollToTopButton from './components/ScrollToTopButton'
import SupabaseProvider from './components/SupabaseProvider'
import './globals.css'

// Configure Inter font - optimized for performance
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: true,
});

// Komponenta pre dynamické metadata
function DynamicMetadata() {
  const { lang } = useLanguage();
  useMetadata(lang);
  return null;
}

// Beta komponenty wrapper
function BetaComponents() {
  const { lang } = useLanguage();

  return (
    <>
      <BetaFloatingIcon 
        language={lang} 
      />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isAdminZone = pathname?.startsWith('/admin');

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
              "url": "https://lectio.one",
              "description": "Denné duchovné čítania, modlitby a meditácie",
              "publisher": {
                "@type": "Organization",
                "name": "Lectio Divina"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://lectio.one/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* Viewport a mobile meta tagy */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#40467b" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Základné meta tagy - budú sa aktualizovať dynamicky */}
        <meta name="description" content="Lectio Divina - Objavte silu duchovného čítania. Denné biblické čítania, modlitby ruženca, meditácie a sprievodca Lectio Divina pre hlbší duchovný život a vzťah s Bohom." />
        <meta name="keywords" content="lectio divina, modlitby, duchovné čítanie, biblia, meditácie, ruženec, duchovný život, katolícka modlitba, denné čítania, biblické verše" />
        
        {/* SEO meta tagy */}
        <link rel="canonical" href="https://lectio.one" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="Lectio Divina" />
        <meta name="generator" content={`Lectio.one CMS v${packageJson.version}`} />
        <meta name="language" content="Slovak" />
        <meta name="geo.region" content="SK" />
        <meta name="geo.country" content="Slovakia" />
        
        {/* Open Graph meta tagy */}
        <meta property="og:title" content="Lectio Divina - Duchovné čítanie a modlitby" />
        <meta property="og:description" content="Objavte silu duchovného čítania. Denné biblické čítania, modlitby ruženca, meditácie a sprievodca Lectio Divina pre hlbší duchovný život." />
        <meta property="og:url" content="https://lectio.one" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Lectio Divina" />
        <meta property="og:locale" content="sk_SK" />
        <meta property="og:image" content="https://lectio.one/home_intro.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Lectio Divina - Duchovné čítanie a modlitby" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lectio Divina - Duchovné čítanie a modlitby" />
        <meta name="twitter:description" content="Objavte silu duchovného čítania. Denné biblické čítania, modlitby ruženca a meditácie." />
        <meta name="twitter:image" content="https://lectio.one/home_intro.jpg" />
        <meta name="twitter:image:alt" content="Lectio Divina - Duchovné čítanie a modlitby" />
        
        {/* Favicon - kompletná sada */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Performance Optimizations - Preload kritických zdrojov */}
        <link rel="preload" href="/hero-background.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="dns-prefetch" href="https://analytics.lectio.one" />
        <link rel="preconnect" href="https://analytics.lectio.one" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://unnijykbupxguogrkolj.supabase.co" />
        <link rel="preconnect" href="https://unnijykbupxguogrkolj.supabase.co" crossOrigin="anonymous" />
        
        {/* Preload kritických CSS/JS chunks - inline kritické CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS - inline pre okamžité načítanie */
            :root{--color-primary:#40467b;--color-primary-light:#686ea3}
            *{box-sizing:border-box}
            body{margin:0;padding:0;font-family:var(--font-inter),system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
            .min-h-screen{min-height:100vh}
            .flex{display:flex}
            .relative{position:relative}
            .fixed{position:fixed}
            .absolute{position:absolute}
            .z-50{z-index:50}
          `
        }} />
        
        {/* Umami Analytics */}
        <Script
          src="https://analytics.lectio.one/script.js"
          data-website-id="c7311d25-b9b7-4c15-9d15-333962066cdb"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.className} min-h-screen overflow-x-hidden bg-white text-black snap-y snap-mandatory overflow-y-auto`} suppressHydrationWarning>
        <LanguageProvider>
          <CookieConsentProvider>
            <SupabaseProvider session={null}>
              <DynamicMetadata />
              <BetaComponents />
              {children}
              {!isAdminZone && <Footer />}
              <ScrollToTopButton />
            </SupabaseProvider>
          </CookieConsentProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}