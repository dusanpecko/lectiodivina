// src/app/components/Layout.tsx
import { ReactNode } from 'react';
import { useSupabase } from './SupabaseProvider';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { session } = useSupabase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Lectio Divina
              </Link>
            </div>
            
            {session && (
              <nav className="flex space-x-4">
                <Link href="/notes" className="text-gray-700 hover:text-blue-600">
                  My Notes
                </Link>
                <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                  Admin
                </Link>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}