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

export const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  // ✅ KRITICKÁ OPRAVA - Initialize states immediately for hydration
  const [visible, setVisible] = useState(false);
  const [consentStatus, setConsentStatus] = useState<'accepted' | 'declined' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [autoShowTimeoutId, setAutoShowTimeoutId] = useState<NodeJS.Timeout | null>(null);

  console.log('🏗️ CookieConsentProvider render START:', { visible, consentStatus, isLoaded, mounted });

  // ✅ KRITICKÁ OPRAVA - Use useLayoutEffect for immediate mounting
  useEffect(() => {
    console.log('🏗️ useEffect [MOUNT] triggered');
    
    // Set mounted immediately
    setMounted(true);
    
    // Load consent status immediately
    if (typeof window !== 'undefined') {
      try {
        console.log('🏗️ Loading consent status immediately...');
        const status = getCookieConsentStatus();
        console.log('🍪 Consent status loaded:', status);
        
        setConsentStatus(status);
        setIsLoaded(true);
        
        // If no consent, show banner after short delay
        if (status === null) {
          console.log('🍪 No consent found, scheduling banner...');
          const timeoutId = setTimeout(() => {
            console.log('🍪 Showing banner now!');
            setVisible(true);
          }, 500);
          setAutoShowTimeoutId(timeoutId);
        }
      } catch (error) {
        console.error('❌ Error loading consent status:', error);
        setConsentStatus(null);
        setIsLoaded(true);
        setMounted(true);
        
        // Show banner on error too
        const timeoutId = setTimeout(() => {
          console.log('🍪 Showing banner after error');
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
        console.log('🍪 Cleaning up timeout');
        clearTimeout(autoShowTimeoutId);
      }
    };
  }, [autoShowTimeoutId]);

  // ✅ Handle storage changes
  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cookieConsent') {
        console.log('🍪 Storage change detected');
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
        console.log('🍪 Focus refresh:', newStatus);
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
    console.log('🍪 showIfNeeded called:', { mounted, isLoaded, consentStatus, visible });
    
    if (consentStatus === null && !visible) {
      console.log('🍪 Showing banner via showIfNeeded');
      setVisible(true);
    }
  }, [mounted, isLoaded, consentStatus, visible]);

  const open = useCallback(() => {
    console.log('🍪 Manual open called');
    if (autoShowTimeoutId) {
      clearTimeout(autoShowTimeoutId);
      setAutoShowTimeoutId(null);
    }
    setVisible(true);
  }, [autoShowTimeoutId]);

  const close = useCallback(() => {
    console.log('🍪 Close called');
    setVisible(false);
    
    // Refresh status
    if (typeof window !== 'undefined') {
      const newStatus = getCookieConsentStatus();
      console.log('🍪 Status after close:', newStatus);
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

  console.log('🏗️ CookieConsentProvider render END:', { 
    visible, 
    mounted, 
    isLoaded,
    consentStatus,
    contextValueLoaded: contextValue.isLoaded 
  });

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
      {/* ✅ KRITICKÁ OPRAVA - Always render CookieConsent, let it handle its own logic */}
      <CookieConsent 
        visible={visible} 
        onClose={close} 
        showIfNeeded={showIfNeeded}
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