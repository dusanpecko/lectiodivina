// src/components/useCookieConsent.ts
import { useState, useEffect, useCallback } from "react";

export type CookieConsentStatus = "accepted" | "declined" | null;

export function useCookieConsent() {
  const [status, setStatus] = useState<CookieConsentStatus>(null);
  const [visible, setVisible] = useState(false);

  // Načítaj stav z localStorage pri načítaní stránky
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cookieConsent");
      if (stored === "accepted" || stored === "declined") {
        setStatus(stored);
      }
    }
  }, []);

  // Funkcie na zmenu súhlasu
  const accept = useCallback(() => {
    setStatus("accepted");
    setVisible(false);
    localStorage.setItem("cookieConsent", "accepted");
    // ... tu môžeš spustiť analytiku
  }, []);

  const decline = useCallback(() => {
    setStatus("declined");
    setVisible(false);
    localStorage.setItem("cookieConsent", "declined");
    // ... tu môžeš vypnúť analytiku
  }, []);

  // Otvor popup pre zmenu rozhodnutia
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  // Automaticky otvor ak ešte nebolo rozhodnuté
  useEffect(() => {
    if (status === null) {
      setTimeout(() => setVisible(true), 400);
    }
  }, [status]);

  return { status, accept, decline, visible, open, close };
}
