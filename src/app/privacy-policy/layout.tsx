// src/app/privacy-policy/layout.tsx
import NavBar from "@/app/components/NavBar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ochrana osobných údajov | Lectio Divina",
  description: "Zásady ochrany osobných údajov KROK – Pastoračný fond Žilinskej diecézy. Informácie o spracúvaní osobných údajov podľa GDPR.",
  keywords: ["ochrana osobných údajov", "GDPR", "súkromie", "cookies", "Lectio Divina", "KROK"],
  authors: [{ name: "KROK – Pastoračný fond Žilinskej diecézy" }],
  robots: "index, follow",
  openGraph: {
    title: "Ochrana osobných údajov | Lectio Divina",
    description: "Zásady ochrany osobných údajov KROK – Pastoračný fond Žilinskej diecézy podľa GDPR.",
    type: "website",
    locale: "sk_SK",
    siteName: "Lectio Divina"
  },
  alternates: {
    canonical: "https://www.lectiodivina.sk/privacy-policy"
  }
};

export default function PrivacyPolicyLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Sticky navbar pre lepšiu UX */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20">
        <NavBar />
      </div>
      
      {/* Main content wrapper */}
      <main className="flex-1 w-full">
        {children}
      </main>
      
      {/* Optional: Schema.org strukturované dáta pre lepšie SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Ochrana osobných údajov",
            "description": "Zásady ochrany osobných údajov KROK – Pastoračný fond Žilinskej diecézy",
            "url": "https://www.lectiodivina.sk/privacy-policy",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Lectio Divina",
              "url": "https://www.lectiodivina.sk"
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
            "dateModified": "2024-11-02",
            "inLanguage": ["sk", "en", "cs", "es"]
          })
        }}
      />
    </div>
  );
}