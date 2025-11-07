// app/account/layout.tsx
import NavBar from "@/app/components/NavBar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
