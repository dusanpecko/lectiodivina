// src/app/programs/layout.tsx
import NavBar from "@/app/components/NavBar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Duchovné programy a kurzy | Lectio Divina",
  description: "Objavte kolekciu duchovných programov, meditácií, modlitieb a biblických štúdií. Prehĺbte svoju vieru s našimi starostlivo vytvorenými lekciami a cvičeniami.",
  keywords: [
    "duchovné programy", "modlitby", "meditácie", "biblické štúdium", 
    "duchovné cvičenia", "Lectio Divina", "usínanie", "rozjímanie",
    "duchovný rast", "katolícke učenie", "spiritualita"
  ],
  authors: [{ name: "KROK – Pastoračný fond Žilinskej diecézy" }],
  robots: "index, follow",
  openGraph: {
    title: "Duchovné programy a kurzy | Lectio Divina",
    description: "Objavte kolekciu duchovných programov, meditácií, modlitieb a biblických štúdií pre prehĺbenie vašej viery.",
    type: "website",
    locale: "sk_SK",
    siteName: "Lectio Divina",
    images: [
      {
        url: "/api/og?title=Duchovn%C3%A9%20programy%20a%20kurzy",
        width: 1200,
        height: 630,
        alt: "Lectio Divina - Duchovné programy a kurzy"
      }
    ]
  },
  alternates: {
    canonical: "https://www.lectio.one/programs"
  }
};

export default function ProgramsLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced navbar pre programs sekciu */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg border-b border-white/20">
        <NavBar />
        
        {/* Programs specific navigation breadcrumb */}
        <div className="border-t border-gray-100/50">
          <div className="container mx-auto px-6 py-2">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <a href="/" className="hover:text-blue-600 transition-colors">
                Domov
              </a>
              <span>/</span>
              <span className="text-blue-600 font-medium">Programy</span>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Main content s optimalizovaným spacing pre programs */}
      <main className="flex-1 w-full">
        {children}
      </main>
      
      {/* Enhanced Schema.org structured data pre programs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Duchovné programy a kurzy",
            "description": "Kolekcia duchovných programov, meditácií, modlitieb a biblických štúdií",
            "url": "https://www.lectio.one/programs",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Lectio Divina",
              "url": "https://www.lectio.one"
            },
            "mainEntity": {
              "@type": "Course",
              "name": "Duchovné programy Lectio Divina",
              "description": "Kompletná kolekcia duchovných programov pre rôzne úrovne a záujmy",
              "provider": {
                "@type": "Organization",
                "name": "KROK – Pastoračný fond Žilinskej diecézy",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Jána Kalinčiaka 1",
                  "addressLocality": "Žilina",
                  "postalCode": "010 01",
                  "addressCountry": "SK"
                }
              },
              "courseMode": "online",
              "educationalLevel": "Beginner to Advanced",
              "inLanguage": ["sk", "en", "cs", "es"],
              "hasCourseInstance": [
                {
                  "@type": "CourseInstance",
                  "courseMode": "online",
                  "courseWorkload": "PT1H",
                  "instructor": {
                    "@type": "Person",
                    "name": "Duchovní poradci Žilinskej diecézy"
                  }
                }
              ],
              "about": [
                {
                  "@type": "Thing",
                  "name": "Duchovnosť"
                },
                {
                  "@type": "Thing", 
                  "name": "Modlitba"
                },
                {
                  "@type": "Thing",
                  "name": "Meditácia"
                },
                {
                  "@type": "Thing",
                  "name": "Biblické štúdium"
                }
              ]
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Domov",
                  "item": "https://www.lectio.one"
                },
                {
                  "@type": "ListItem", 
                  "position": 2,
                  "name": "Programy",
                  "item": "https://www.lectio.one/programs"
                }
              ]
            },
            "publisher": {
              "@type": "Organization",
              "name": "KROK – Pastoračný fond Žilinskej diecézy",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.lectio.one/logo.png"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+421902982982",
                "email": "info@lectio.one",
                "contactType": "customer service"
              }
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.lectio.one/programs?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "dateModified": new Date().toISOString(),
            "inLanguage": ["sk", "en", "cs", "es"]
          })
        }}
      />
    </div>
  );
}