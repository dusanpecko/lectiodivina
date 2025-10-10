"use client";

import React from 'react';
import { Shield } from "lucide-react";
import { useLanguage } from '@/app/components/LanguageProvider';
import { adminTranslations } from '../translations';

export default function SystemStatusCard() {
  const { lang } = useLanguage();
  const t = adminTranslations[lang];
  
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-xl p-6 border border-green-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-600 rounded-xl">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t.systemWorking}
            </h3>
            <p className="text-gray-600">
              {t.allServicesOnline}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-600">{t.online}</span>
        </div>
      </div>
    </div>
  );
}
