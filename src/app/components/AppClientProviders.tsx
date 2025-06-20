// AKTUALIZUJTE: src/app/components/AppClientProviders.tsx
"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs"; // ← ZMENA: nový import
import { useState } from "react";
import CookieConsentProvider from "./CookieConsentProvider";

export default function AppClientProviders({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient()); // ← ZMENA: nový client

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <CookieConsentProvider>
        {children}
      </CookieConsentProvider>
    </SessionContextProvider>
  );
}
