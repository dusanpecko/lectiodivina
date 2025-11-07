// app/checkout/layout.tsx
import NavBar from "@/app/components/NavBar";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1 py-8 pt-24">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>Zabezpečená platba cez Stripe</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
