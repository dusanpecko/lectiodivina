// ============================================
// src/lib/supabase/server.ts - OPRAVENÉ
// ============================================
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// ✅ OPRAVENÉ - funkcia je SYNC a s await na cookies()
export async function createClient() {
  const cookieStore = await cookies(); // ✅ PRIDANÉ await
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // V Next.js App Router, cookies môžu byť nastavené len v Server Actions/Route Handlers
            console.warn('Cookie set failed (expected in client-side context):', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: -1 });
          } catch (error) {
            console.warn('Cookie remove failed (expected in client-side context):', error);
          }
        },
      },
    }
  );
}