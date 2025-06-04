"use client";
import { createContext, useContext, useState } from "react";

export type Language = "sk" | "cz" | "en" | "es";

const LanguageContext = createContext<{
  lang: Language;
  changeLang: (lng: Language) => void;
} | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("sk");
  const changeLang = (lng: Language) => setLang(lng);
  return (
    <LanguageContext.Provider value={{ lang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
