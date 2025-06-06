"use client";
import NavBar from "../components/NavBar";
import "../globals.css";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NavBar hore */}
      <div className="border-b shadow-sm bg-white px-8 py-4">
        <NavBar />
      </div>
      <main className="flex-1 flex items-center justify-center">{children}</main>
    </div>
  );
}
