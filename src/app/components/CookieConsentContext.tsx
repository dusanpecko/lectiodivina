//app/components/CookieConsentContext.tsx
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

type CookieConsentProps = {
  visible: boolean;
  onClose: () => void;
  showIfNeeded: () => void;
};

export const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [consentStatus, setConsentStatus] = useState<'accepted' | 'declined' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [autoShowTimeoutId, setAutoShowTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Mark as mounted first
  useEffect(() => {
    setMounted(true);
  }, []);

  // HYDRATION SAFE: Load consent status only after mount
  useEffect(() => {
    if (!mounted) return;

    try {
      const status = getCookieConsentStatus();
      setConsentStatus(status);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading cookie consent status:', error);
      setIsLoaded(true);
    }
  }, [mounted]);

  // Handle storage changes - only after mount
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
  }, [consentStatus, autoShowTimeoutId, mounted]);

  // Cleanup timeout pri unmount
  useEffect(() => {
    return () => {
      if (autoShowTimeoutId) {
        clearTimeout(autoShowTimeoutId);
      }
    };
  }, [autoShowTimeoutId]);

  const showIfNeeded = useCallback(() => {
    if (mounted && isLoaded && consentStatus === null && !visible) {
      if (autoShowTimeoutId) {
        clearTimeout(autoShowTimeoutId);
      }
      
      const timeoutId = setTimeout(() => {
        setVisible(true);
        setAutoShowTimeoutId(null);
      }, 1500);
      
      setAutoShowTimeoutId(timeoutId);
    }
  }, [mounted, isLoaded, consentStatus, visible, autoShowTimeoutId]);

  const open = useCallback(() => {
    if (autoShowTimeoutId) {
      clearTimeout(autoShowTimeoutId);
      setAutoShowTimeoutId(null);
    }
    setVisible(true);
  }, [autoShowTimeoutId]);

  const close = useCallback(() => {
    setVisible(false);
    if (mounted) {
      const newStatus = getCookieConsentStatus();
      setConsentStatus(newStatus);
    }
  }, [mounted]);

  // Auto-show logic - only after mount
  useEffect(() => {
    if (mounted && isLoaded && consentStatus === null && !visible && !autoShowTimeoutId) {
      showIfNeeded();
    }
  }, [mounted, isLoaded, consentStatus, visible, autoShowTimeoutId, showIfNeeded]);

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
      {/* Only render CookieConsent after mount */}
      {mounted && (
        <CookieConsent 
          visible={visible} 
          onClose={close} 
          showIfNeeded={showIfNeeded}
        />
      )}
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