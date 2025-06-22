// src/components/CookieConsent.tsx
"use client";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/app/i18n";
import { useEffect, useRef, useState } from "react";
import { setCookieConsent, removeAppCookies, removeAppLocalStorage } from "../utils/cookieHelpers";

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
  const [isProcessing, setIsProcessing] = useState(false);

  // Zabráni hydration errorom
  useEffect(() => {
    setIsClient(true);
    // Malý delay pre plynulé zobrazenie
    const timer = setTimeout(() => {
      showIfNeeded();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [showIfNeeded]);

  // Focus management pre accessibility
  useEffect(() => {
    if (visible && acceptRef.current && !isProcessing) {
      const timer = setTimeout(() => {
        acceptRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [visible, isProcessing]);

  const acceptCookies = async () => {
    if (!isClient || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Používame centralizovanú funkciu
      setCookieConsent("accepted");
      
      // Tu môžeš spustiť Analytics alebo iné tracking služby
      // initializeGoogleAnalytics();
      // initializeFacebookPixel();
      
      console.log("✅ Cookies accepted successfully");
      
      // Malý delay pre UX
      await new Promise(resolve => setTimeout(resolve, 200));
      onClose();
      
    } catch (error) {
      console.error("❌ Chyba pri ukladaní cookie súhlasu:", error);
      
      // Fallback: použij session cookie
      try {
        document.cookie = "cookieConsent=accepted; path=/; SameSite=Strict; Secure";
        onClose();
      } catch (fallbackError) {
        console.error("❌ Fallback cookie failed:", fallbackError);
        // Aj tak zatvor dialog
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const declineCookies = async () => {
    if (!isClient || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Používame centralizovanú funkciu
      setCookieConsent("declined");
      
      // Vymaž tracking data
      removeAppLocalStorage();
      removeAppCookies();
      
      // Vypni tracking služby
      // disableGoogleAnalytics();
      // disableFacebookPixel();
      
      console.log("✅ Cookies declined successfully");
      
      // Malý delay pre UX
      await new Promise(resolve => setTimeout(resolve, 200));
      onClose();
      
    } catch (error) {
      console.error("❌ Chyba pri odmietnutí cookies:", error);
      
      // Fallback: použij session cookie
      try {
        document.cookie = "cookieConsent=declined; path=/; SameSite=Strict; Secure";
        removeAppCookies();
        onClose();
      } catch (fallbackError) {
        console.error("❌ Fallback cookie failed:", fallbackError);
        // Aj tak zatvor dialog
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && !isProcessing) {
      onClose();
    }
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    // Zatvor len ak klikneš na overlay, nie na dialog
    if (event.target === event.currentTarget && !isProcessing) {
      onClose();
    }
  };

  // Nerender na serveri alebo ak nie je viditeľný
  if (!isClient || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 text-center relative animate-fade-in border transform transition-all duration-300 scale-100">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          aria-label={t.close || "Zavrieť"}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✕
        </button>
        
        {/* Cookie icon */}
        <div className="mb-4">
          <span className="text-4xl" role="img" aria-label="Cookie">🍪</span>
        </div>
        
        {/* Title */}
        <h3 id="cookie-consent-title" className="text-xl font-bold mb-3 text-gray-900">
          {t.cookie_title || "Súhlas s cookies"}
        </h3>
        
        {/* Description */}
        <p id="cookie-consent-description" className="text-gray-600 mb-6 text-sm leading-relaxed">
          {t.cookie_text ||
            "Táto stránka používa cookies na analýzu návštevnosti a zlepšenie používateľského zážitku. Vaše súkromie je pre nás dôležité."}
        </p>
        
        {/* Rozšírená informácia */}
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded">
            {t.cookie_details || "Viac informácií o cookies"}
          </summary>
          <div className="mt-2 text-xs text-gray-500 space-y-2 pl-4 border-l-2 border-gray-200">
            <p><strong>Funkčné cookies:</strong> Potrebné pre základné fungovanie stránky</p>
            <p><strong>Analytické cookies:</strong> Pomáhajú nám pochopiť, ako návštevníci používajú stránku</p>
            <p><strong>Marketing cookies:</strong> Používané na zobrazovanie relevantných reklám</p>
          </div>
        </details>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            ref={acceptRef}
            onClick={acceptCookies}
            disabled={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[3rem]"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Spracováva sa...</span>
              </div>
            ) : (
              t.accept_cookies || "Prijať všetko"
            )}
          </button>
          
          <button
            onClick={declineCookies}
            disabled={isProcessing}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-full font-semibold shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[3rem]"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Spracováva sa...</span>
              </div>
            ) : (
              t.decline_cookies || "Odmietnuť"
            )}
          </button>
        </div>
        
        {/* Privacy policy link */}
        <p className="text-xs text-gray-400 mt-4">
          {t.cookie_policy_link || "Viac informácií nájdete v našich"}{" "}
          <a 
            href="/privacy-policy" 
            className="text-indigo-600 hover:text-indigo-800 underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
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