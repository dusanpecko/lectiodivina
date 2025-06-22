"use client";

import { createContext, useContext, useState } from "react";

export type CookieConsentContextType = {
  open: () => void;
  close: () => void;
  visible: boolean;
};

export const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

// ✅ Provider
export const CookieConsentProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  return (
    <CookieConsentContext.Provider value={{ open, close, visible }}>
      {children}
    </CookieConsentContext.Provider>
  );
};

// ✅ Hook
export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return ctx;
}
