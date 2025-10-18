// src/app/privacy/layout.tsx
import NavBar from "@/app/components/NavBar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ochrana osobných údajov - Mobilná aplikácia | Lectio Divina",
  description: "Zásady ochrany osobných údajov pre mobilnú aplikáciu Lectio Divina. Informácie o spracúvaní údajov, cookies a všeobecných podmienkach používania aplikácie.",
  keywords: ["mobilná aplikácia", "ochrana osobných údajov", "GDPR", "push notifikácie", "Lectio Divina", "KROK", "cookies"],
  authors: [{ name: "KROK – Pastoračný fond Žilinskej diecézy" }],
  robots: "index, follow",
  openGraph: {
    title: "Ochrana osobných údajov - Mobilná aplikácia | Lectio Divina",
    description: "Zásady ochrany osobných údajov pre mobilnú aplikáciu Lectio Divina podľa GDPR.",
    type: "website",
    locale: "sk_SK",
    siteName: "Lectio Divina",
    images: [
      {
        url: "/api/og?title=Privacy%20Policy%20-%20Mobile%20App",
        width: 1200,
        height: 630,
        alt: "Lectio Divina - Privacy Policy Mobile App"
      }
    ]
  },
  alternates: {
    canonical: "https://www.lectio.one/privacy"
  },
  other: {
    "mobile-app": "Lectio Divina",
    "app-store-id": "6443882687",
    "google-play-id": "sk.dpapp.app.android604688a88a394"
  }
};

export default function MobilePrivacyLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Sticky navbar s mobilným zameraním */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20">
        <NavBar />
      </div>
      
      {/* Main content wrapper */}
      <main className="flex-1 w-full">
        {children}
      </main>
      
      {/* Schema.org strukturované dáta pre mobilnú aplikáciu */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Ochrana osobných údajov - Mobilná aplikácia",
            "description": "Zásady ochrany osobných údajov pre mobilnú aplikáciu Lectio Divina",
            "url": "https://www.lectio.one/privacy",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Lectio Divina",
              "url": "https://www.lectio.one"
            },
            "about": {
              "@type": "MobileApplication",
              "name": "Lectio Divina",
              "description": "Mobilná aplikácia pre duchovné čítanie a meditáciu",
              "operatingSystem": ["iOS", "Android"],
              "applicationCategory": "Lifestyle",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
              },
              "downloadUrl": [
                "https://apps.apple.com/sk/app/lectio-divina/id6443882687",
                "https://play.google.com/store/apps/details?id=sk.dpapp.app.android604688a88a394"
              ]
            },
            "publisher": {
              "@type": "Organization",
              "name": "KROK – Pastoračný fond Žilinskej diecézy",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Jána Kalinčiaka 1",
                "addressLocality": "Žilina",
                "postalCode": "010 01",
                "addressCountry": "SK"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+421902982982",
                "email": "info@lectio.one",
                "contactType": "customer service"
              }
            },
            "dateModified": "2024-11-02",
            "inLanguage": ["sk", "en", "cs", "es"]
          })
        }}
      />
    </div>
  );
}