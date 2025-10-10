// src/app/rosary/loading.tsx
"use client";

import { useLanguage } from '@/app/components/LanguageProvider';
import { rosaryTranslations } from './translations';

export default function Loading() {
  const { lang } = useLanguage();
  const t = rosaryTranslations[lang];
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {t.loading}
        </h2>
        <p className="text-gray-600">
          {t.preparingPath}
        </p>
      </div>
    </div>
  );
}