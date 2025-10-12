// src/components/useCookieConsent.ts
import { useState, useEffect, useCallback } from "react";
import { removeAppCookies, removeAppLocalStorage, setCookieConsent } from "../utils/cookieHelpers";

export type CookieConsentStatus = "accepted" | "declined" | null;

export function useCookieConsent() {
  const [status, setStatus] = useState<CookieConsentStatus>(null);
  const [visible, setVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Načítaj stav z localStorage pri načítaní stránky
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cookieConsent");
        if (stored === "accepted" || stored === "declined") {
          setStatus(stored);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading cookie consent:", error);
        setIsLoaded(true);
      }
    }
  }, []);

  // Funkcie na zmenu súhlasu
  const accept = useCallback(() => {
    if (typeof window === "undefined") return;
    
    try {
      setStatus("accepted");
      setVisible(false);
      setCookieConsent("accepted");
      
      // Tu môžeš spustiť analytiku/tracking
      // initializeGoogleAnalytics();
      // initializeFacebookPixel();
      
      console.log("Cookies accepted");
    } catch (error) {
      console.error("Error accepting cookies:", error);
    }
  }, []);

  const decline = useCallback(() => {
    if (typeof window === "undefined") return;
    
    try {
      setStatus("declined");
      setVisible(false);
      setCookieConsent("declined");
      
      // Vymaž tracking data a vypni analytiku
      removeAppCookies();
      removeAppLocalStorage();
      
      // Vypni tracking služby
      // disableGoogleAnalytics();
      // disableFacebookPixel();
      
      console.log("Cookies declined");
    } catch (error) {
      console.error("Error declining cookies:", error);
    }
  }, []);

  // Otvor popup pre zmenu rozhodnutia
  const open = useCallback(() => {
    setVisible(true);
  }, []);
  
  const close = useCallback(() => {
    setVisible(false);
  }, []);

  // Automaticky otvor ak ešte nebolo rozhodnuté (len po načítaní)
  useEffect(() => {
    if (isLoaded && status === null) {
      // Malý delay pre plynulé zobrazenie
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [status, isLoaded]);

  // Public API
  return { 
    status, 
    accept, 
    decline, 
    visible, 
    open, 
    close,
    isLoaded // Užitočné pre conditional rendering
  };
}