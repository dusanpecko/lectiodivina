// src/components/CookieConsentContext.tsx
import { createContext, useContext } from "react";

export type CookieConsentContextType = {
  open: () => void;
  close: () => void;
  visible: boolean;
};

export const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return ctx;
}
