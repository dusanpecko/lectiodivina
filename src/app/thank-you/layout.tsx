// app/thank-you/layout.tsx
import NavBar from "@/app/components/NavBar";

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      <NavBar />
      <main className="flex-1 flex items-center justify-center py-12 pt-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
