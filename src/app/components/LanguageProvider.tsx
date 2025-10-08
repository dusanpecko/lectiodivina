//app/components/LanguageProvider.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export type Language = "sk" | "cz" | "en" | "es";
type LanguageContextType = {
  lang: Language;
  changeLang: (lang: Language) => void;
  isLoaded: boolean;
};

// Vytvoríme Context
const LanguageContext = createContext<LanguageContextType>({
  lang: "sk",
  changeLang: () => {},
  isLoaded: false,
});

// Provider pre celú appku
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("sk"); // Default pre SSR
  const [isLoaded, setIsLoaded] = useState(false);

  // HYDRATION SAFE: Načítaj z localStorage až PO mount
  useEffect(() => {
    // Načítaj saved jazyk z localStorage
    const storedLang = localStorage.getItem("preferredLang");
    if (storedLang && ["sk", "cz", "en", "es"].includes(storedLang)) {
      setLang(storedLang as Language);
    }
    setIsLoaded(true);
  }, []);

  // Pri zmene jazyka: uložiť do localStorage - MEMOIZE with useCallback
  const changeLang = useCallback((newLang: Language) => {
    console.log('🌐 LanguageProvider: changeLang called with', newLang);
    setLang(newLang);
    localStorage.setItem("preferredLang", newLang);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ 
    lang, 
    changeLang, 
    isLoaded 
  }), [lang, changeLang, isLoaded]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook pre pohodlné použitie v komponentoch
export function useLanguage() {
  return useContext(LanguageContext);
}