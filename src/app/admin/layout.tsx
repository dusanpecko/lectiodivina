"use client";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // session === undefined na začiatku -> čakáme na načítanie
    if (session !== undefined) {
      setLoading(false);
      if (session === null) {
        router.replace("/login");
      }
    }
  }, [session, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span>Načítavam...</span>
      </div>
    );
  }

  // Ak je session, zobraz admin rozhranie
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
