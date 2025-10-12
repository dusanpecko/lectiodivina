"use client";
import { type Language } from "@/app/i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import { removeAppCookies, removeAppLocalStorage, setCookieConsent } from "../utils/cookieHelpers";
import { cookieTranslations } from "./cookieTranslations";
import { useLanguage } from "./LanguageProvider";

type Props = {
  visible: boolean;
  onClose: () => void;
};

// Language switcher component for cookie dialog
function LanguageSwitcher({ currentLang, onLanguageChange }: { currentLang: string, onLanguageChange: (lang: Language) => void }) {
  const languages = [
  { code: 'sk' as Language, flag: '🇸🇰', label: 'Slovenčina' },
  { code: 'cz' as Language, flag: '🇨🇿', label: 'Čeština' },  
    { code: 'en' as Language, flag: '🇬🇧', label: 'English' },
    { code: 'es' as Language, flag: '🇪🇸', label: 'Español' }
  ];

  const handleLanguageChange = (langCode: Language) => {
    console.log('🍪 Cookie dialog: Button clicked, changing to', langCode);
    console.log('🍪 Current lang before change:', currentLang);
    onLanguageChange(langCode);
  };

  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => handleLanguageChange(language.code)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentLang === language.code
              ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={language.label}
        >
          <span className="text-lg">{language.flag}</span>
          <span className="text-xs hidden sm:inline">{language.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

export default function CookieConsent({ visible, onClose }: Props) {
  const { lang, changeLang, isLoaded } = useLanguage();
  
  const cookieT = useMemo(() => {
    return cookieTranslations[lang] || cookieTranslations.sk;
  }, [lang]);
  
  const acceptRef = useRef<HTMLButtonElement>(null);

  // Debug log to track re-renders
  console.log('🍪 CookieConsent render with lang:', lang, 'title:', cookieT?.title);
  
  // Handle language change from switcher
  const handleLanguageChange = (newLang: Language) => {
    console.log('🍪 handleLanguageChange called with:', newLang);
    console.log('🍪 Current lang before:', lang);
    changeLang(newLang);
    console.log('🍪 changeLang called, waiting for re-render...');
  };
  
  // Debug function - accessible from browser console (only in development)
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as typeof window & { clearCookieConsent?: () => void }).clearCookieConsent = () => {
        localStorage.removeItem('cookieConsent');
        window.location.reload();
      };
    }
  }, []);
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
      console.error(`❌ ${cookieT.error_accepting}:`, error);
      
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
      console.error(`❌ ${cookieT.error_declining}:`, error);
      
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
      key={`cookie-dialog-${lang}`}
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300"
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
    >
      <div 
        ref={dialogRef}
        className="rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center relative animate-fade-in transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          aria-label={cookieT.close_aria_label}
          className="absolute top-4 right-4 text-gray-400 text-xl w-8 h-8 flex items-center justify-center rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          style={{ background: 'rgba(64, 70, 123, 0.1)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(64, 70, 123, 0.2)';
            e.currentTarget.style.color = '#40467b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(64, 70, 123, 0.1)';
            e.currentTarget.style.color = '#9ca3af';
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Cookie icon */}
        <div className="mb-4 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(64, 70, 123, 0.15)' }}>
            <span className="text-4xl" role="img" aria-label="Cookie">🍪</span>
          </div>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher currentLang={lang} onLanguageChange={handleLanguageChange} />
        
        {/* Title */}
        <h3 id="cookie-consent-title" className="text-2xl font-bold mb-4" style={{ color: '#40467b' }}>
          {cookieT.title}
        </h3>
        
        {/* Description */}
        <p id="cookie-consent-description" className="text-gray-600 mb-6 text-sm leading-relaxed">
          {cookieT.description}
        </p>
        
        {/* Rozšírená informácia */}
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm font-medium focus:outline-none rounded px-2 py-2 transition-colors" style={{ color: '#40467b' }} onMouseEnter={(e) => e.currentTarget.style.color = '#686ea3'} onMouseLeave={(e) => e.currentTarget.style.color = '#40467b'}>
            {cookieT.more_info}
          </summary>
          <div className="mt-3 text-xs text-gray-600 space-y-3 pl-4" style={{ borderLeft: '2px solid rgba(64, 70, 123, 0.3)' }}>
            <div>
              <strong style={{ color: '#40467b' }}>Funkčné cookies:</strong>
              <p className="mt-1">Potrebné pre základné fungovanie stránky (navigácia, autentifikácia)</p>
            </div>
            <div>
              <strong style={{ color: '#40467b' }}>Analytické cookies:</strong>
              <p className="mt-1">Pomáhajú nám pochopiť, ako návštevníci používajú stránku (Google Analytics)</p>
            </div>
            <div>
              <strong style={{ color: '#40467b' }}>Marketing cookies:</strong>
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
            className="text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[3rem]"
            style={{ background: '#40467b' }}
            onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = '#686ea3')}
            onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.background = '#40467b')}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Spracováva sa...</span>
              </div>
            ) : (
              cookieT.accept_all
            )}
          </button>
          
          <button
            onClick={declineCookies}
            disabled={isProcessing}
            className="text-gray-700 px-6 py-3 rounded-xl font-semibold shadow transition-all duration-200 hover:shadow-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[3rem]"
            style={{ background: 'rgba(64, 70, 123, 0.1)' }}
            onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = 'rgba(64, 70, 123, 0.2)')}
            onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.background = 'rgba(64, 70, 123, 0.1)')}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Spracováva sa...</span>
              </div>
            ) : (
              cookieT.decline_all
            )}
          </button>
        </div>
        
        {/* Privacy policy link */}
        <p className="text-xs text-gray-500 mt-6">
          {cookieT.policy_link_text}{" "}
          <a 
            href="/privacy-policy" 
            className="underline focus:outline-none rounded transition-colors"
            style={{ color: '#40467b' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#686ea3'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#40467b'}
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