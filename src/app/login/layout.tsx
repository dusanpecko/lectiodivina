"use client";
import NavBar from "../components/NavBar";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse [animation-delay:4s]"></div>
        
        {/* Pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Floating shapes */}
        <div className="absolute top-32 right-32 w-4 h-4 bg-blue-400/40 rounded-full animate-bounce [animation-delay:1s]"></div>
        <div className="absolute bottom-32 left-32 w-6 h-6 bg-purple-400/40 rounded-full animate-bounce [animation-delay:3s]"></div>
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-pink-400/40 rounded-full animate-bounce [animation-delay:5s]"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-full">
        {/* Navigation */}
        <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <NavBar />
          </div>
        </div>

        {/* Login content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Ľavá strana – info a testimonial (nezmenené) */}
            {/* Pravá strana – formulár (nezmenené) */}
            {/* (obsah nechávam podľa tvojho kódu, iba zmeny okolo rozloženia/scrollu) */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
