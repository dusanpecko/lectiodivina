// src/app/layout.tsx
import "./globals.css";
import { LanguageProvider } from "./components/LanguageProvider";
import AppClientProviders from "./components/AppClientProviders"; // Toto poskytuje SessionContextProvider
import Footer from "./components/Footer";

export const metadata = {
  title: "Lectio Divina",
  description: "Lectio Divina web app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <LanguageProvider>
          <AppClientProviders>
            {children}
            <Footer />
          </AppClientProviders>
        </LanguageProvider>
      </body>
    </html>
  );
}
