// app/terms-of-service/layout.tsx
import NavBar from "@/app/components/NavBar";

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <main className="flex-1 py-12 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>Posledná aktualizácia: {new Date().toLocaleDateString('sk-SK')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
