// src/app/profile/layout.tsx
import NavBar from "@/app/components/NavBar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil používateľa - Administrácia | Lectio Divina",
  description: "Spravujte svoj profil v administračnom rozhraní aplikácie Lectio Divina. Zmeňte svoje údaje, avatar a nastavenia účtu.",
  keywords: ["profil", "administrácia", "účet", "nastavenia", "Lectio Divina", "KROK", "admin panel"],
  authors: [{ name: "KROK – Pastoračný fond Žilinskej diecézy" }],
  robots: "noindex, nofollow", // Admin stránky by nemali byť indexované
  openGraph: {
    title: "Profil používateľa - Administrácia | Lectio Divina",
    description: "Administračné rozhranie pre správu používateľského profilu v aplikácii Lectio Divina.",
    type: "website",
    locale: "sk_SK",
    siteName: "Lectio Divina Admin",
    images: [
      {
        url: "/api/og?title=User%20Profile%20-%20Admin%20Panel",
        width: 1200,
        height: 630,
        alt: "Lectio Divina - Admin Profile Panel"
      }
    ]
  },
  alternates: {
    canonical: "https://www.lectiodivina.sk/profile"
  },
  other: {
    "admin-panel": "Lectio Divina",
    "access-level": "admin",
    "requires-auth": "true"
  }
};

export default function ProfileLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed navbar pre admin rozhranie */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
        <NavBar />
      </div>
      
      {/* Main content wrapper s padding pre navbar */}
      <main className="pt-16 min-h-screen w-full">
        {children}
      </main>
      
      {/* Schema.org strukturované dáta pre admin profil */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Profil používateľa - Administrácia",
            "description": "Administračné rozhranie pre správu používateľského profilu",
            "url": "https://www.lectiodivina.sk/profile",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Lectio Divina Admin",
              "url": "https://www.lectiodivina.sk"
            },
            "about": {
              "@type": "WebApplication",
              "name": "Lectio Divina Admin Panel",
              "description": "Administračné rozhranie pre správu mobilnej aplikácie Lectio Divina",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "permissions": "admin"
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
                "email": "admin@lectiodivina.sk",
                "contactType": "technical support"
              }
            },
            "dateModified": new Date().toISOString().split('T')[0],
            "inLanguage": ["sk", "en"],
            "potentialAction": [
              {
                "@type": "UpdateAction",
                "name": "Upraviť profil",
                "description": "Aktualizovať používateľské údaje a nastavenia"
              },
              {
                "@type": "UploadAction",
                "name": "Nahrať avatar",
                "description": "Nahrať nový profilový obrázok"
              }
            ],
            "mainEntity": {
              "@type": "UserProfile",
              "name": "Administrátorský profil",
              "description": "Profil administrátora aplikácie Lectio Divina"
            }
          })
        }}
      />
      
      {/* Bezpečnostné hlavičky pre admin rozhranie */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Zabezpečenie admin rozhrania
            if (typeof window !== 'undefined') {
              // Disable right-click context menu v admin paneli
              document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
              });
              
              // Disable F12, Ctrl+Shift+I, Ctrl+U
              document.addEventListener('keydown', function(e) {
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && e.key === 'I') || 
                    (e.ctrlKey && e.key === 'U')) {
                  e.preventDefault();
                }
              });
            }
          `
        }}
      />
    </div>
  );
}