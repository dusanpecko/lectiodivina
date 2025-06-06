// src/app/components/AppClientProviders.tsx
"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import CookieConsentProvider from "./CookieConsentProvider";

export default function AppClientProviders({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <CookieConsentProvider>
        {children}
      </CookieConsentProvider>
    </SessionContextProvider>
  );
}
