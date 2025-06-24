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
  const { lang, isLoaded } = useLanguage();
  const t = translations[lang];
  const acceptRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ KRITICKÁ OPRAVA - Mark as mounted immediately
  useEffect(() => {
    setMounted(true);
    console.log('🍪 CookieConsent mounted');
  }, []);

  // ✅ KRITICKÁ OPRAVA - Removed dependency on showIfNeeded to prevent blocking
  useEffect(() => {
    if (mounted && isLoaded) {
      console.log('🍪 CookieConsent ready, language loaded');
    }
  }, [mounted, isLoaded]);

  // Focus management - only after mount
  useEffect(() => {
    if (mounted && visible && acceptRef.current && !isProcessing) {
      const timer = setTimeout(() => {
        acceptRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [visible, isProcessing, mounted]);

  // Focus trap - only after mount
  useEffect(() => {
    if (!mounted || !visible) return;

    const focusableElements = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [visible, mounted]);

  // Prevent body scroll - only after mount
  useEffect(() => {
    if (mounted && visible) {
      document.body.style.overflow = 'hidden';
      console.log('🍪 Body scroll disabled');
      return () => {
        document.body.style.overflow = 'unset';
        console.log('🍪 Body scroll restored');
      };
    }
  }, [visible, mounted]);

  const acceptCookies = async () => {
    if (!mounted || isProcessing) return;
    
    console.log('🍪 Accepting cookies...');
    setIsProcessing(true);
    
    try {
      setCookieConsent("accepted");
      console.log("✅ Cookies accepted successfully");
      
      await new Promise(resolve => setTimeout(resolve, 200));
      onClose();
      
    } catch (error) {
      console.error("❌ Chyba pri ukladaní cookie súhlasu:", error);
      
      try {
        document.cookie = "cookieConsent=accepted; path=/; SameSite=Strict; Secure";
        onClose();
      } catch (fallbackError) {
        console.error("❌ Fallback cookie failed:", fallbackError);
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const declineCookies = async () => {
    if (!mounted || isProcessing) return;
    
    console.log('🍪 Declining cookies...');
    setIsProcessing(true);
    
    try {
      setCookieConsent("declined");
      removeAppLocalStorage();
      removeAppCookies();
      
      console.log("✅ Cookies declined successfully");
      
      await new Promise(resolve => setTimeout(resolve, 200));
      onClose();
      
    } catch (error) {
      console.error("❌ Chyba pri odmietnutí cookies:", error);
      
      try {
        document.cookie = "cookieConsent=declined; path=/; SameSite=Strict; Secure";
        removeAppCookies();
        onClose();
      } catch (fallbackError) {
        console.error("❌ Fallback cookie failed:", fallbackError);
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
    if (event.target === event.currentTarget && !isProcessing) {
      onClose();
    }
  };

  // ✅ KRITICKÁ OPRAVA - Render immediately after mount, don't wait for isLoaded
  if (!mounted) {
    console.log('🍪 CookieConsent not mounted yet');
    return null;
  }

  if (!visible) {
    console.log('🍪 CookieConsent not visible');
    return null;
  }

  console.log('🍪 CookieConsent rendering dialog');

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
      <div 
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 text-center relative animate-fade-in border transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          aria-label="Zavrieť"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Cookie icon */}
        <div className="mb-4">
          <span className="text-4xl" role="img" aria-label="Cookie">🍪</span>
        </div>
        
        {/* Title */}
        <h3 id="cookie-consent-title" className="text-xl font-bold mb-3 text-gray-900">
          {isLoaded && t.cookie_title ? t.cookie_title : "Súhlas s cookies"}
        </h3>
        
        {/* Description */}
        <p id="cookie-consent-description" className="text-gray-600 mb-6 text-sm leading-relaxed">
          {isLoaded && t.cookie_text ? t.cookie_text :
            "Táto stránka používa cookies na analýzu návštevnosti a zlepšenie používateľského zážitku. Vaše súkromie je pre nás dôležité."}
        </p>
        
        {/* Rozšírená informácia */}
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-1 py-1">
            {isLoaded && t.cookie_details ? t.cookie_details : "Viac informácií o cookies"}
          </summary>
          <div className="mt-3 text-xs text-gray-500 space-y-2 pl-4 border-l-2 border-gray-200">
            <div>
              <strong className="text-gray-700">Funkčné cookies:</strong>
              <p className="mt-1">Potrebné pre základné fungovanie stránky (navigácia, autentifikácia)</p>
            </div>
            <div>
              <strong className="text-gray-700">Analytické cookies:</strong>
              <p className="mt-1">Pomáhajú nám pochopiť, ako návštevníci používajú stránku (Google Analytics)</p>
            </div>
            <div>
              <strong className="text-gray-700">Marketing cookies:</strong>
              <p className="mt-1">Používané na zobrazovanie relevantných reklám a meranie ich účinnosti</p>
            </div>
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
              isLoaded && t.accept_cookies ? t.accept_cookies : "Prijať všetko"
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
              isLoaded && t.decline_cookies ? t.decline_cookies : "Odmietnuť"
            )}
          </button>
        </div>
        
        {/* Privacy policy link */}
        <p className="text-xs text-gray-400 mt-4">
          {isLoaded && t.cookie_policy_link ? t.cookie_policy_link : "Viac informácií nájdete v našich"}{" "}
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

      {/* ✅ PRIDANÉ - Fade in animation styles */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}