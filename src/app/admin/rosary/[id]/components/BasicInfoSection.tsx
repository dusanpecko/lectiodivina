"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import TranslateButton from "@/app/components/TranslateButton";
import { BookOpen, Crown, FileText, Globe, Sparkles } from "lucide-react";
import { rosaryAdminTranslations } from "../translations";

interface BasicFormData {
  ruzenec?: string;
  biblicky_text?: string;
  kategoria?: string;
  lang?: string;
  uvod?: string;
}

interface BasicInfoSectionProps {
  formData: BasicFormData;
  updateFormField: (field: string, value: string) => void;
  handleSingleFieldTranslation: (fieldName: string, translatedText: string) => void;
  kategorie: Array<{ id: number; nazov: string; popis: string }>;
  LANGUAGE_OPTIONS: Array<{ value: string; label: string; flag: string }>;
  appLang: string;
  saving: boolean;
}

const inputStyles = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#686ea3';
    e.target.style.boxShadow = '0 0 0 3px rgba(104, 110, 163, 0.1)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#d1d5db';
    e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
  }
};

export default function BasicInfoSection({
  formData,
  updateFormField,
  handleSingleFieldTranslation,
  kategorie,
  LANGUAGE_OPTIONS,
  appLang,
  saving
}: BasicInfoSectionProps) {
  const { lang } = useLanguage();
  const rt = rosaryAdminTranslations[lang as keyof typeof rosaryAdminTranslations] || rosaryAdminTranslations.sk;

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#40467b' }}>
          <FileText size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: '#40467b' }}>{rt.basicInfo.title}</h2>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: '#40467b' }}>
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: '#686ea3' }} />
                {rt.basicInfo.rosaryType} <span className="text-red-500">*</span>
              </div>
            </label>
            <input
              type="text"
              name="ruzenec"
              value={formData.ruzenec || ""}
              onChange={(e) => updateFormField('ruzenec', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:border-transparent shadow-sm"
              onFocus={inputStyles.onFocus}
              onBlur={inputStyles.onBlur}
              placeholder={rt.basicInfo.rosaryType + "..."}
              maxLength={150}
              required
            />
            <p className={`text-xs mt-1 ${(formData.ruzenec?.length || 0) > 135 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
              {formData.ruzenec?.length || 0}/150 znakov
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: '#40467b' }}>
              <div className="flex items-center gap-2">
                <BookOpen size={16} style={{ color: '#686ea3' }} />
                {rt.biblicalText.title} <span className="text-red-500">*</span>
              </div>
            </label>
            <input
              type="text"
              name="biblicky_text"
              value={formData.biblicky_text || ""}
              onChange={(e) => updateFormField('biblicky_text', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:border-transparent shadow-sm"
              onFocus={inputStyles.onFocus}
              onBlur={inputStyles.onBlur}
              placeholder={rt.biblicalText.placeholder}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: '#40467b' }}>
              <div className="flex items-center gap-2">
                <Crown size={16} style={{ color: '#686ea3' }} />
                {rt.basicInfo.category} <span className="text-red-500">*</span>
              </div>
            </label>
            <select
              name="kategoria"
              value={formData.kategoria || "radostné"}
              onChange={(e) => updateFormField('kategoria', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:border-transparent shadow-sm"
              onFocus={inputStyles.onFocus}
              onBlur={inputStyles.onBlur}
              required
            >
              {kategorie.map(k => (
                <option key={k.id} value={k.nazov}>
                  {k.nazov} - {k.popis}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: '#40467b' }}>
              <div className="flex items-center gap-2">
                <Globe size={16} style={{ color: '#686ea3' }} />
                {rt.basicInfo.language} <span className="text-red-500">*</span>
              </div>
            </label>
            <select
              name="lang"
              value={formData.lang || appLang}
              onChange={(e) => updateFormField('lang', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:border-transparent shadow-sm"
              onFocus={inputStyles.onFocus}
              onBlur={inputStyles.onBlur}
            >
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold" style={{ color: '#40467b' }}>
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: '#686ea3' }} />
                {rt.intro.title}
              </div>
            </label>
            <TranslateButton
              text={formData.uvod || ""}
              fieldType="spiritual"
              onTranslated={(translatedText) => handleSingleFieldTranslation('uvod', translatedText)}
              disabled={saving}
            />
          </div>
          <p className="text-xs text-gray-500">{rt.intro.description}</p>
          <textarea
            name="uvod"
            value={formData.uvod || ""}
            onChange={(e) => updateFormField('uvod', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:border-transparent shadow-sm resize-none"
            onFocus={inputStyles.onFocus}
            onBlur={inputStyles.onBlur}
            placeholder={rt.intro.placeholder}
            rows={4}
            style={{ height: '6rem' }}
          />
        </div>
      </div>
    </div>
  );
}