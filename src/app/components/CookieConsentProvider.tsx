// src/components/CookieConsentProvider.tsx
"use client";
import { useState, useCallback, useMemo } from "react";
import { CookieConsentContext } from "./CookieConsentContext";
import CookieConsent from "./CookieConsent";

export default function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  // Spustí sa iba keď to užívateľ ešte nevyplnil
  const showIfNeeded = useCallback(() => {
    if (!localStorage.getItem("cookieConsent")) setVisible(true);
  }, []);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const value = useMemo(() => ({ open, close, visible }), [open, close, visible]);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      <CookieConsent visible={visible} onClose={close} showIfNeeded={showIfNeeded} />
    </CookieConsentContext.Provider>
  );
}
