'use client';

import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number with gradient */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center">
            <span className="text-5xl">🙏</span>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Stránka nebola nájdená
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Ľutujeme, ale stránka, ktorú hľadáte, neexistuje alebo bola presunutá.
          </p>
        </div>

        {/* Bible Verse */}
        <div className="mb-10 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-indigo-100">
          <p className="text-gray-700 italic mb-2">
            &ldquo;Hľadajte a nájdete, klopte a otvorí sa vám.&rdquo;
          </p>
          <p className="text-sm text-indigo-600 font-medium">
            — Mt 7,7
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Domov
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Späť
          </button>
        </div>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4 font-medium">Populárne stránky:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link 
              href="/lectio"
              className="px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm border border-gray-100"
            >
              📖 Lectio Divina
            </Link>
            <Link 
              href="/rosary"
              className="px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm border border-gray-100"
            >
              📿 Ruženec
            </Link>
            <Link 
              href="/prayers"
              className="px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm border border-gray-100"
            >
              🙏 Modlitby
            </Link>
            <Link 
              href="/news"
              className="px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm border border-gray-100"
            >
              📰 Aktuality
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <p className="text-xs text-gray-400">
            Potrebujete pomoc? Kontaktujte nás na{' '}
            <a href="mailto:info@lectio.one" className="text-indigo-600 hover:underline">
              info@lectio.one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
