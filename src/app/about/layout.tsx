// app/about/layout.tsx
import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
      <NavBar />
      <main className="flex-1">
        {children}
      </main>
      
    </div>
  );
}