// app/spiritual-exercises/layout.tsx
import NavBar from "@/app/components/NavBar";

export default function SpiritualExercisesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
      <NavBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
