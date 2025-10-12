// src/components/CookieConsentContext.tsx

"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCookieConsentStatus } from "../utils/cookieHelpers";
import CookieConsent from "./CookieConsent";

// ✅ OPRAVENÉ - zjednotené typy
export type CookieConsentContextType = {
  open: () => void;
  close: () => void;
  visible: boolean;
  showIfNeeded: () => void;
  consentStatus: 'accepted' | 'declined' | null;
  isLoaded: boolean;
};

export const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

// ✅ Hlavný Provider s integrovaným CookieConsent komponentom
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [consentStatus, setConsentStatus] = useState<'accepted' | 'declined' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [autoShowTimeoutId, setAutoShowTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Načítaj consent status pri štarte
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const status = getCookieConsentStatus();
        setConsentStatus(status);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading cookie consent status:', error);
        setIsLoaded(true);
      }
    }
  }, []);

  // Aktualizuj consent status keď sa zmení v localStorage (cross-tab sync)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cookieConsent') {
        const newStatus = getCookieConsentStatus();
        setConsentStatus(newStatus);
        
        // Ak sa status zmenil, zatvor dialog a zruš timeout
        if (newStatus !== null) {
          setVisible(false);
          if (autoShowTimeoutId) {
            clearTimeout(autoShowTimeoutId);
            setAutoShowTimeoutId(null);
          }
        }
      }
    };

    const handleFocus = () => {
      // Refresh status keď sa užívateľ vráti na tab
      const newStatus = getCookieConsentStatus();
      if (newStatus !== consentStatus) {
        setConsentStatus(newStatus);
        if (newStatus !== null) {
          setVisible(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [consentStatus, autoShowTimeoutId]);

  // Cleanup timeout pri unmount
  useEffect(() => {
    return () => {
      if (autoShowTimeoutId) {
        clearTimeout(autoShowTimeoutId);
      }
    };
  }, [autoShowTimeoutId]);

  // Spustí sa iba keď užívateľ ešte nevyplnil consent (len po načítaní)
  const showIfNeeded = useCallback(() => {
    if (isLoaded && consentStatus === null && !visible) {
      // Zruš existujúci timeout ak existuje
      if (autoShowTimeoutId) {
        clearTimeout(autoShowTimeoutId);
      }
      
      // Malý delay pre plynulé zobrazenie po načítaní stránky
      const timeoutId = setTimeout(() => {
        setVisible(true);
        setAutoShowTimeoutId(null);
      }, 1500);
      
      setAutoShowTimeoutId(timeoutId);
    }
  }, [isLoaded, consentStatus, visible, autoShowTimeoutId]);

  const open = useCallback(() => {
    // Zruš auto-show timeout ak užívateľ manuálne otvorí
    if (autoShowTimeoutId) {
      clearTimeout(autoShowTimeoutId);
      setAutoShowTimeoutId(null);
    }
    setVisible(true);
  }, [autoShowTimeoutId]);

  const close = useCallback(() => {
    setVisible(false);
    // Refresh consent status po zatvorení
    const newStatus = getCookieConsentStatus();
    setConsentStatus(newStatus);
  }, []);

  // Auto-show logic - spustí sa len raz po načítaní
  useEffect(() => {
    if (isLoaded && consentStatus === null && !visible && !autoShowTimeoutId) {
      showIfNeeded();
    }
  }, [isLoaded, consentStatus, visible, autoShowTimeoutId, showIfNeeded]);

  // Memoizuj context value pre performance
  const contextValue = useMemo(() => ({
    open,
    close,
    visible,
    showIfNeeded,
    consentStatus,
    isLoaded
  }), [open, close, visible, showIfNeeded, consentStatus, isLoaded]);

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
      {/* ✅ CookieConsent komponent s upravenými props */}
      <CookieConsent 
        visible={visible} 
        onClose={close} 
      />
    </CookieConsentContext.Provider>
  );
}

// ✅ Hook s lepším error handling
export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  
  if (context === undefined) {
    throw new Error(
      'useCookieConsent must be used within a CookieConsentProvider. ' +
      'Wrap your app with <CookieConsentProvider>...</CookieConsentProvider>'
    );
  }
  
  return context;
}