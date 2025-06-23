// app/news/layout.tsx
import NavBar from "@/app/components/NavBar";

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky navbar for better UX */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <NavBar />
      </div>
      
      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  );
}