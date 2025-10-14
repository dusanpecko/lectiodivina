"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

export const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  // ✅ KRITICKÁ OPRAVA - Initialize states immediately for hydration
  const [visible, setVisible] = useState(false);
  const [consentStatus, setConsentStatus] = useState<'accepted' | 'declined' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [autoShowTimeoutId, setAutoShowTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // ✅ KRITICKÁ OPRAVA - Use useLayoutEffect for immediate mounting
  useEffect(() => {
    // Set mounted immediately
    setMounted(true);
    
    // Load consent status immediately
    if (typeof window !== 'undefined') {
      try {
        const status = getCookieConsentStatus();
        
        setConsentStatus(status);
        setIsLoaded(true);
        
        // If no consent, show banner after short delay
        if (status === null) {
          const timeoutId = setTimeout(() => {
            setVisible(true);
          }, 500);
          setAutoShowTimeoutId(timeoutId);
        }
      } catch (error) {
        console.error('Error loading consent status:', error);
        setConsentStatus(null);
        setIsLoaded(true);
        setMounted(true);
        
        // Show banner on error too
        const timeoutId = setTimeout(() => {
          setVisible(true);
        }, 500);
        setAutoShowTimeoutId(timeoutId);
      }
    }
  }, []); // ✅ Empty dependency array - run once immediately

  // ✅ Cleanup timeouts
  useEffect(() => {
    return () => {
      if (autoShowTimeoutId) {
        clearTimeout(autoShowTimeoutId);
      }
    };
  }, [autoShowTimeoutId]);

  // ✅ Handle storage changes
  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cookieConsent') {
        const newStatus = getCookieConsentStatus();
        setConsentStatus(newStatus);
        
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
  }, [mounted, consentStatus, autoShowTimeoutId]);

  const showIfNeeded = useCallback(() => {
    if (consentStatus === null && !visible) {
      setVisible(true);
    }
  }, [consentStatus, visible]);

  const open = useCallback(() => {
    if (autoShowTimeoutId) {
      clearTimeout(autoShowTimeoutId);
      setAutoShowTimeoutId(null);
    }
    setVisible(true);
  }, [autoShowTimeoutId]);

  const close = useCallback(() => {
    setVisible(false);
    
    // Refresh status
    if (typeof window !== 'undefined') {
      const newStatus = getCookieConsentStatus();
      setConsentStatus(newStatus);
    }
  }, []);

  const contextValue = useMemo(() => ({
    open,
    close,
    visible,
    showIfNeeded,
    consentStatus,
    isLoaded: mounted && isLoaded
  }), [open, close, visible, showIfNeeded, consentStatus, mounted, isLoaded]);

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
      {/* ✅ KRITICKÁ OPRAVA - Always render CookieConsent, let it handle its own logic */}
      <CookieConsent 
        visible={visible} 
        onClose={close} 
      />
    </CookieConsentContext.Provider>
  );
}

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