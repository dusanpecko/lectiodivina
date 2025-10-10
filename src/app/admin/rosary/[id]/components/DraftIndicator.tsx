"use client";

import { useLanguage } from '@/app/components/LanguageProvider';
import { rosaryAdminTranslations } from '../translations';

interface DraftIndicatorProps {
  isDraftAvailable: boolean;
  clearDraft: () => void;
}

export default function DraftIndicator({ isDraftAvailable, clearDraft }: DraftIndicatorProps) {
  const { lang } = useLanguage();
  const rt = rosaryAdminTranslations[lang as keyof typeof rosaryAdminTranslations] || rosaryAdminTranslations.sk;

  if (!isDraftAvailable) return null;

  return (
    <div className="border rounded-xl p-4 mb-6 shadow-lg" style={{ backgroundColor: 'rgba(104, 110, 163, 0.1)', borderColor: '#686ea3' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📝</span>
          <span className="font-medium" style={{ color: '#40467b' }}>
            {rt.messages.draftLoaded}
          </span>
        </div>
        <button
          type="button"
          onClick={clearDraft}
          className="text-sm underline transition-colors duration-200 hover:scale-105"
          style={{ color: '#686ea3' }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#40467b'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#686ea3'}
        >
          {rt.messages.clearDraft}
        </button>
      </div>
    </div>
  );
}