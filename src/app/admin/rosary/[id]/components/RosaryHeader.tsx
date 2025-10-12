"use client";

import EditPageHeader from '@/app/admin/components/EditPageHeader';
import { useLanguage } from '@/app/components/LanguageProvider';
import { Sparkles } from "lucide-react";
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
  const { lang } = useLanguage();
  const rt = rosaryAdminTranslations[lang as keyof typeof rosaryAdminTranslations] || rosaryAdminTranslations.sk;

  // Pri návrate načítaj uložený jazyk filtra
  const getBackUrl = () => {
    const savedLang = localStorage.getItem('rosary_filter_lang');
    if (savedLang && ['sk', 'cz', 'en', 'es'].includes(savedLang)) {
      return `/admin/rosary?lang=${savedLang}`;
    }
    return '/admin/rosary';
  };

  return (
    <EditPageHeader
      title={
        isNew 
          ? rt.header.newRosary
          : `${rt.header.editRosary}: ${formData.ruzenec}`
      }
      description={isNew ? rt.header.newDescription : rt.header.editDescription}
      icon={Sparkles}
      backUrl={getBackUrl()}
      emoji={isNew ? "✨" : "📿"}
      hasUnsavedChanges={hasUnsavedChanges}
      isDraftAvailable={isDraftAvailable}
      unsavedText={rt.header.unsavedChanges}
      draftText={rt.header.draftLoaded}
    />
  );
}