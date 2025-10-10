"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from '@/app/components/LanguageProvider';
import { rosaryAdminTranslations } from '../translations';

interface RosaryHeaderProps {
  isNew: boolean;
  formData: { ruzenec?: string; lang?: string };
  hasUnsavedChanges: boolean;
  isDraftAvailable: boolean;
}

export default function RosaryHeader({ 
  isNew, 
  formData, 
  hasUnsavedChanges, 
  isDraftAvailable 
}: RosaryHeaderProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const rt = rosaryAdminTranslations[lang as keyof typeof rosaryAdminTranslations] || rosaryAdminTranslations.sk;

  const handleBackClick = () => {
    // Pri návrate načítaj uložený jazyk filtra
    const savedLang = localStorage.getItem('rosary_filter_lang');
    if (savedLang && ['sk', 'cz', 'en', 'es'].includes(savedLang)) {
      router.push(`/admin/rosary?lang=${savedLang}`);
    } else {
      router.push('/admin/rosary');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackClick}
            className="p-3 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#40467b' }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#686ea3'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#40467b'}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #40467b 0%, #686ea3 100%)' }}>
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#40467b' }}>
              {isNew 
                ? rt.header.newRosary
                : `${rt.header.editRosary}: ${formData.ruzenec}`
              }
            </h1>
            <p className="text-gray-600">
              {isNew ? rt.header.newDescription : rt.header.editDescription}
            </p>
            {/* Status indikátor */}
            <div className="flex items-center space-x-4 text-sm mt-2">
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <span>●</span>
                  <span>{rt.header.unsavedChanges}</span>
                </div>
              )}
              {isDraftAvailable && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <span>📝</span>
                  <span>{rt.header.draftLoaded}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-4xl">
          {isNew ? "✨" : "📿"}
        </div>
      </div>
    </div>
  );
}