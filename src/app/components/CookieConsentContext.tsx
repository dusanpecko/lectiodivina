// ============================================
// src/components/CookieConsentContext.tsx - OPRAVENÉ
// ============================================
"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { getCookieConsentStatus } from "../utils/cookieHelpers";
import CookieConsent from "./CookieConsent";

export type CookieConsentContextType = {
  open: () => void;
  close: () => void;
  visible: boolean;
  showIfNeeded: () => void;
  consentStatus: 'accepted' | 'declined' | null;
  isLoaded: boolean;
};

// ✅ OPRAVENÉ - jediné export pre Context
export const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

// ✅ Hlavný Provider s integrovaným CookieConsent komponentom
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [consentStatus, setConsentStatus] = useState<'accepted' | 'declined' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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
        
        // Ak sa status zmenil, zatvor dialog
        if (newStatus !== null) {
          setVisible(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Spustí sa iba keď užívateľ ešte nevyplnil consent (len po načítaní)
  const showIfNeeded = useCallback(() => {
    if (isLoaded && consentStatus === null) {
      // Malý delay pre plynulé zobrazenie po načítaní stránky
      setTimeout(() => {
        setVisible(true);
      }, 1500);
    }
  }, [isLoaded, consentStatus]);

  const open = useCallback(() => {
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    // Refresh consent status po zatvorení
    const newStatus = getCookieConsentStatus();
    setConsentStatus(newStatus);
  }, []);

  // Auto-show logic
  useEffect(() => {
    if (isLoaded && consentStatus === null && !visible) {
      showIfNeeded();
    }
  }, [isLoaded, consentStatus, visible, showIfNeeded]);

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
      {/* ✅ CookieConsent komponent je integrovaný v Provider */}
      <CookieConsent 
        visible={visible} 
        onClose={close} 
        showIfNeeded={showIfNeeded}
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