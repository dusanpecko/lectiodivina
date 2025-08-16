// src/app/notes/layout.tsx
import NavBar from "@/app/components/NavBar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moje poznámky - Lectio Divina | Duchovné zápisky a úvahy",
  description: "Osobné poznámky a duchovné úvahy k denným čítaniam. Vytvárajte si vlastné zápisky s biblickými citátmi a meditáciami v aplikácii Lectio Divina.",
  keywords: ["poznámky", "duchovné úvahy", "biblické citáty", "meditácie", "Lectio Divina", "KROK", "duchovné čítanie"],
  authors: [{ name: "KROK – Pastoračný fond Žilinskej diecézy" }],
  robots: "noindex, nofollow", // Poznámky sú súkromné
  openGraph: {
    title: "Moje poznámky - Lectio Divina",
    description: "Osobné poznámky a duchovné úvahy k denným čítaniam",
    type: "website",
    locale: "sk_SK",
    siteName: "Lectio Divina",
    images: [
      {
        url: "/api/og?title=My%20Notes%20-%20Lectio%20Divina",
        width: 1200,
        height: 630,
        alt: "Lectio Divina - My Notes"
      }
    ]
  },
  alternates: {
    canonical: "https://www.lectiodivina.sk/notes"
  }
};

export default function NotesLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Sticky navbar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20">
        <NavBar />
      </div>
      
      {/* Main content wrapper */}
      <main className="flex-1 w-full">
        {children}
      </main>
      
      {/* Schema.org strukturované dáta pre notes sekciu */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Moje poznámky - Lectio Divina",
            "description": "Osobné poznámky a duchovné úvahy k denným čítaniam",
            "url": "https://www.lectiodivina.sk/notes",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Lectio Divina",
              "url": "https://www.lectiodivina.sk"
            },
            "about": {
              "@type": "WebApplication",
              "name": "Notes Section",
              "description": "Osobné poznámky a duchovné úvahy používateľov",
              "applicationCategory": "Productivity",
              "isAccessibleForFree": true
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
                "telephone": "+421902575575",
                "email": "info@lectiodivina.sk",
                "contactType": "customer service"
              }
            },
            "dateModified": new Date().toISOString(),
            "inLanguage": ["sk", "en", "cs", "es"]
          })
        }}
      />
    </div>
  );
}
