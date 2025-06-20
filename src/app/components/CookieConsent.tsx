// src/components/CookieConsent.tsx
"use client";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/app/i18n";
import { useEffect, useRef, useState } from "react";
import { removeAppCookies, removeAppLocalStorage } from "../utils/cookieHelpers";

type Props = {
  visible: boolean;
  onClose: () => void;
  showIfNeeded: () => void;
};

export default function CookieConsent({ visible, onClose, showIfNeeded }: Props) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const acceptRef = useRef<HTMLButtonElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Zabráni hydration errorom
  useEffect(() => {
    setIsClient(true);
    showIfNeeded();
  }, [showIfNeeded]);

  useEffect(() => {
    if (visible && acceptRef.current) {
      acceptRef.current.focus();
    }
  }, [visible]);

  const acceptCookies = () => {
    if (!isClient) return;
    
    try {
      localStorage.setItem("cookieConsent", "accepted");
      localStorage.setItem("cookieConsentDate", new Date().toISOString());
      
      // Tu môžeš spustiť Analytics alebo iné tracking služby
      // initializeAnalytics();
      
      onClose();
    } catch (error) {
      console.error("Chyba pri ukladaní cookie súhlasu:", error);
      // Fallback: použij session cookie
      document.cookie = "cookieConsent=accepted; path=/; SameSite=Strict";
      onClose();
    }
  };

  const declineCookies = () => {
    if (!isClient) return;
    
    try {
      // Dôležité: Stále musíme uložiť rozhodnutie používateľa
      localStorage.setItem("cookieConsent", "declined");
      localStorage.setItem("cookieConsentDate", new Date().toISOString());
      
      // Vymaž všetky analytické/tracking cookies a localStorage
      removeAppLocalStorage();
      removeAppCookies();
      
      // Vypni všetky tracking služby
      // disableAnalytics();
      
      onClose();
    } catch (error) {
      console.error("Chyba pri odmietnutí cookies:", error);
      // Fallback: použij session cookie
      document.cookie = "cookieConsent=declined; path=/; SameSite=Strict";
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  // Nerender na serveri
  if (!isClient || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 text-center relative animate-fade-in border">
        <button
          onClick={onClose}
          aria-label={t.close || "Zavrieť"}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>
        
        <div className="mb-4">
          <span className="text-4xl" role="img" aria-label="Cookie">🍪</span>
        </div>
        
        <h3 id="cookie-consent-title" className="text-xl font-bold mb-3 text-gray-900">
          {t.cookie_title || "Súhlas s cookies"}
        </h3>
        
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          {t.cookie_text ||
            "Táto stránka používa cookies na analýzu návštevnosti a zlepšenie používateľského zážitku. Vaše súkromie je pre nás dôležité."}
        </p>
        
        {/* Rozšírená informácia */}
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            {t.cookie_details || "Viac informácií o cookies"}
          </summary>
          <div className="mt-2 text-xs text-gray-500 space-y-2">
            <p><strong>Funkčné cookies:</strong> Potrebné pre základné fungovanie stránky</p>
            <p><strong>Analytické cookies:</strong> Pomáhajú nám pochopiť, ako návštevníci používajú stránku</p>
            <p><strong>Marketing cookies:</strong> Používané na zobrazovanie relevantných reklám</p>
          </div>
        </details>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            ref={acceptRef}
            onClick={acceptCookies}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {t.accept_cookies || "Prijať všetko"}
          </button>
          
          <button
            onClick={declineCookies}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-full font-semibold shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            {t.decline_cookies || "Odmietnuť"}
          </button>
        </div>
        
        <p className="text-xs text-gray-400 mt-4">
          {t.cookie_policy_link || "Viac informácií nájdete v našich"}{" "}
          <a 
            href="/privacy-policy" 
            className="text-indigo-600 hover:text-indigo-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            zásadách ochrany súkromia
          </a>
        </p>
      </div>
    </div>
  );
}