"use client";

import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from '@/app/components/LanguageProvider';
import { rosaryAdminTranslations } from '../translations';

interface SaveButtonsSectionProps {
  saving: boolean;
  isUploading: boolean;
  isNew: boolean;
}

export default function SaveButtonsSection({ saving, isUploading, isNew }: SaveButtonsSectionProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const rt = rosaryAdminTranslations[lang as keyof typeof rosaryAdminTranslations] || rosaryAdminTranslations.sk;

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.push('/admin/rosary')}
          className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: '#686ea3' }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#40467b'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#686ea3'}
        >
          <ArrowLeft size={16} className="mr-2" />
          {rt.buttons.backToList}
        </button>
        
        <button
          type="submit"
          disabled={saving || isUploading}
          className="inline-flex items-center px-8 py-3 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#40467b' }}
          onMouseEnter={(e) => !e.currentTarget.disabled && ((e.target as HTMLButtonElement).style.backgroundColor = '#686ea3')}
          onMouseLeave={(e) => !e.currentTarget.disabled && ((e.target as HTMLButtonElement).style.backgroundColor = '#40467b')}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              {rt.buttons.saving}
            </>
          ) : isUploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              {rt.buttons.uploading}
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              {isNew ? rt.buttons.createRosary : rt.buttons.saveChanges}
            </>
          )}
        </button>
      </div>
    </div>
  );
}