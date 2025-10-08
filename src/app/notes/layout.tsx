// src/app/notes/layout.tsx
import NavBar from "@/app/components/NavBar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    sk: "Moje poznámky - Lectio Divina | Duchovné zápisky a úvahy",
    cz: "Moje poznámky - Lectio Divina | Duchovní zápisky a úvahy", 
    en: "My Notes - Lectio Divina | Spiritual Notes and Reflections",
    es: "Mis Notas - Lectio Divina | Notas Espirituales y Reflexiones"
  }["sk"] as string, // Default to Slovak for now
  description: {
    sk: "Osobné poznámky a duchovné úvahy k denným čítaniam. Vytvárajte si vlastné zápisky s biblickými citátmi a meditáciami v aplikácii Lectio Divina.",
    cz: "Osobní poznámky a duchovní úvahy k denním čtením. Vytvářejte si vlastní zápisky s biblickými citáty a meditacemi v aplikaci Lectio Divina.",
    en: "Personal notes and spiritual reflections on daily readings. Create your own notes with biblical quotes and meditations in the Lectio Divina app.",
    es: "Notas personales y reflexiones espirituales sobre las lecturas diarias. Crea tus propias notas con citas bíblicas y meditaciones en la aplicación Lectio Divina."
  }["sk"] as string, // Default to Slovak for now
  keywords: ["poznámky", "duchovné úvahy", "biblické citáty", "meditácie", "Lectio Divina", "KROK", "duchovné čítanie"],
  authors: [{ name: "KROK – Pastoračný fond Žilinskej diecézy" }],
  robots: "noindex, nofollow",
};

export default function NotesLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <>
      {/* Fixed navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-white/20">
        <NavBar />
      </div>
      
      {/* Main content - starts below navbar */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {children}
      </div>
    </>
  );
}
