"use client";

import React from 'react';
import { Settings, Clock } from "lucide-react";
import { useLanguage } from '@/app/components/LanguageProvider';
import { adminTranslations } from '../translations';

export default function AdminHeader() {
  const { lang } = useLanguage();
  const t = adminTranslations[lang];
  
  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.welcomeAdmin}
          </h1>
          <p className="text-gray-600 text-lg">
            {t.appManagement}
          </p>
        </div>
        <div className="p-4 rounded-xl" style={{backgroundColor: '#40467b'}}>
          <Settings size={32} className="text-white" />
        </div>
      </div>
      
      {/* Aktuálny čas a dátum */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock size={20} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {new Date().toLocaleDateString(lang === 'sk' ? 'sk-SK' : lang === 'cz' ? 'cs-CZ' : lang === 'en' ? 'en-US' : 'es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleTimeString(lang === 'sk' ? 'sk-SK' : lang === 'cz' ? 'cs-CZ' : lang === 'en' ? 'en-US' : 'es-ES')}
          </div>
        </div>
      </div>
    </div>
  );
}
