// src/app/notes/layout.tsx
import NavBar from "@/app/components/NavBar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moje poznámky - Lectio Divina | Duchovné zápisky a úvahy",
  description: "Osobné poznámky a duchovné úvahy k denným čítaniam. Vytvárajte si vlastné zápisky s biblickými citátmi a meditáciami v aplikácii Lectio Divina.",
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
