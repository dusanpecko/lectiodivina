import LanguageProvider from "./components/LanguageProvider";
import ClientProviders from "./components/ClientProviders";
import NavBar from "./components/NavBar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body className="bg-gray-50 min-h-screen">
        <LanguageProvider>
          <ClientProviders>
            <div className="max-w-full py-8 px-4">
              <NavBar />
              {children}
            </div>
          </ClientProviders>
        </LanguageProvider>
      </body>
    </html>
  );
}
