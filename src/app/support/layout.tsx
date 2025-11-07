// app/support/layout.tsx
import NavBar from "@/app/components/NavBar";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  );
}
