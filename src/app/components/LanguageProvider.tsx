"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "sk" | "cz" | "en" | "es";
type LanguageContextType = {
  lang: Language;
  changeLang: (lang: Language) => void;
};

// Vytvoríme Context
const LanguageContext = createContext<LanguageContextType>({
  lang: "sk",
  changeLang: () => {},
});

// Provider pre celú appku
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("sk");

  // Pri prvom načítaní: načítaj z localStorage ak je tam uložený jazyk
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("preferredLang");
      if (
        storedLang &&
        ["sk", "cz", "en", "es"].includes(storedLang)
      ) {
        setLang(storedLang as Language);
      }
    }
  }, []);

  // Pri zmene jazyka: uložiť do localStorage
  const changeLang = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLang", newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook pre pohodlné použitie v komponentoch
export function useLanguage() {
  return useContext(LanguageContext);
}
