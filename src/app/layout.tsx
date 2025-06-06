"use client";
import { useSession } from "@supabase/auth-helpers-react";
import LanguageProvider from "./components/LanguageProvider";
import ClientProviders from "./components/ClientProviders";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const session = useSession();

  // Tu vieš zobraziť niečo podľa session
  // Napríklad môžeš pridať personalizovaný blok, meno, atď.
  // Alebo odoslať session ako prop do children (napr. cez React context).

  return (
    <html lang="sk">
      <body className="bg-gray-50 min-h-screen">
        <LanguageProvider>
          <ClientProviders>
            {/* Napr. personalizovaná lišta */}
            {/* {session && <div>Prihlásený ako {session.user.email}</div>} */}
            <main>{children}</main>
          </ClientProviders>
        </LanguageProvider>
      </body>
    </html>
  );
}
