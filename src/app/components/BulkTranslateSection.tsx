import { Globe } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { bulkTranslateSectionTranslations, BulkTranslateSectionTranslations } from './bulkTranslateSectionTranslations';

const getAvailableLanguages = (t: BulkTranslateSectionTranslations) => [
  { code: 'en', name: t.languages.english, flag: '🇺🇸' },
  { code: 'de', name: t.languages.german, flag: '🇩🇪' },
  { code: 'it', name: t.languages.italian, flag: '🇮🇹' },
  { code: 'fr', name: t.languages.french, flag: '🇫🇷' },
  { code: 'es', name: t.languages.spanish, flag: '🇪🇸' },
  { code: 'pt', name: t.languages.portuguese, flag: '🇵🇹' },
  { code: 'pl', name: t.languages.polish, flag: '🇵🇱' },
  { code: 'cs', name: t.languages.czech, flag: '🇨🇿' },
  { code: 'hu', name: t.languages.hungarian, flag: '🇭🇺' },
  { code: 'hr', name: t.languages.croatian, flag: '🇭🇷' },
];

interface BulkTranslateProps {
  formData: Record<string, unknown>;
  onFieldsUpdated: (updates: Record<string, string>) => void;
  disabled?: boolean;
}

// Polia ktoré sa majú preložiť hromadne
const getTranslatableFields = (t: BulkTranslateSectionTranslations) => [
  { key: 'hlava', label: 'Nadpis', type: 'hlava' },
  { key: 'lectio_text', label: t.fields.lectio_text, type: 'spiritual' },
  { key: 'meditatio_text', label: t.fields.meditation_text, type: 'spiritual' },
  { key: 'oratio_text', label: 'Oratio text', type: 'spiritual' },
  { key: 'contemplatio_text', label: t.fields.contemplatio_text, type: 'spiritual' },
  { key: 'actio_text', label: 'Actio text', type: 'spiritual' },
  { key: 'reference', label: 'Reference', type: 'reference' },
  { key: 'modlitba_zaver', label: t.fields.prayer_conclusion, type: 'prayer' }
];

interface TranslationProgress {
  total: number;
  completed: number;
  current: string;
  errors: Array<{ field: string; error: string }>;
}

export const BulkTranslateSection: React.FC<BulkTranslateProps> = ({
  formData,
  onFieldsUpdated,
  disabled = false
}) => {
  const { lang } = useLanguage();
  const t = bulkTranslateSectionTranslations[lang];
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [progress, setProgress] = useState<TranslationProgress | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const translateField = async (fieldKey: string, text: string, fieldType: string, targetLanguage: string): Promise<string> => {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        targetLanguage,
        fieldType,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Chyba ${response.status}`);
    }

    return data.translatedText;
  };

  const handleBulkTranslate = async () => {
    if (!selectedLanguage) return;

    const languageInfo = getAvailableLanguages(t).find(lang => lang.code === selectedLanguage);
    if (!languageInfo) return;

    // Filtrovať len polia s textom
    const fieldsToTranslate = getTranslatableFields(t).filter(field => {
      const text = formData[field.key];
      return text && typeof text === 'string' && text.trim().length > 0;
    });

    if (fieldsToTranslate.length === 0) {
      setGlobalError(t.errors.no_text_fields);
      return;
    }

    setIsTranslating(true);
    setGlobalError(null);
    setProgress({
      total: fieldsToTranslate.length,
      completed: 0,
      current: fieldsToTranslate[0].label,
      errors: []
    });

    const translations: Record<string, string> = {};
    const errors: Array<{ field: string; error: string }> = [];

    for (let i = 0; i < fieldsToTranslate.length; i++) {
      const field = fieldsToTranslate[i];
      const text = formData[field.key];

      setProgress(prev => prev ? {
        ...prev,
        current: field.label,
        completed: i
      } : null);

      try {
        const translatedText = await translateField(
          field.key,
          typeof text === 'string' ? text : '',
          field.type,
          languageInfo.name
        );
        translations[field.key] = translatedText;
      } catch (error: unknown) {
        console.error(`Translation error for ${field.key}:`, error);
        errors.push({
          field: field.label,
          error: error instanceof Error ? error.message : t.errors.unknown_error
        });
      }

      // Malá pauza medzi prekladmi
      if (i < fieldsToTranslate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setProgress(prev => prev ? {
      ...prev,
      completed: fieldsToTranslate.length,
      current: t.ui.completed,
      errors
    } : null);

    // Aktualizuj polia ak sú nejaké preklady
    if (Object.keys(translations).length > 0) {
      onFieldsUpdated(translations);
    }

    // Zatvor po 2 sekundách ak nie sú žiadne chyby
    if (errors.length === 0) {
      setTimeout(() => {
        setIsTranslating(false);
        setProgress(null);
        setIsOpen(false);
        setSelectedLanguage('');
      }, 2000);
    } else {
      setIsTranslating(false);
    }
  };

  const fieldsWithText = getTranslatableFields(t).filter(field => {
    const text = formData[field.key];
    return text && typeof text === 'string' && text.trim().length > 0;
  });

  const hasTextToTranslate = fieldsWithText.length > 0;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Globe size={20} className="mr-3 text-gray-600" />
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              {t.header.title}
            </h3>
            <p className="text-xs text-gray-600">
              Preloží všetky textové polia naraz do vybraného jazyka
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-700 bg-gray-200 px-3 py-1 rounded-full">
          {fieldsWithText.length} polí na preklad
        </div>
      </div>

      {!hasTextToTranslate ? (
        <div className="text-center py-4 text-gray-500">
          <span className="text-xl block mb-2">📝</span>
          Najprv vyplňte textové polia
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled || isTranslating}
              style={{ backgroundColor: '#40467b' }}
              className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">🚀</span>
              {isTranslating ? t.ui.translating : t.ui.start_bulk_translation}
            </button>

            {fieldsWithText.length > 0 && (
              <div className="text-sm text-gray-600">
                Polia: {fieldsWithText.map(f => f.label).join(', ')}
              </div>
            )}
          </div>

          {isOpen && !isTranslating && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vybrať cieľový jazyk:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {getAvailableLanguages(t).map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`
                        flex items-center px-3 py-2 text-sm rounded-lg border
                        ${selectedLanguage === lang.code
                          ? 'border-gray-400 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      style={selectedLanguage === lang.code ? { backgroundColor: '#40467b' } : undefined}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedLanguage('');
                    setGlobalError(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Zrušiť
                </button>
                <button
                  type="button"
                  onClick={handleBulkTranslate}
                  disabled={!selectedLanguage}
                  style={{ backgroundColor: '#40467b' }}
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Preložiť všetko
                </button>
              </div>

              {globalError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  {globalError}
                </div>
              )}
            </div>
          )}

          {progress && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">⚡</span>
                <span className="font-semibold">{t.ui.translation_in_progress}</span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t.ui.current_item}: {progress.current}</span>
                  <span>{progress.completed}/{progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.completed / progress.total) * 100}%`, backgroundColor: '#40467b' }}
                  />
                </div>
              </div>

              {progress.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-sm font-semibold text-red-700">Chyby:</div>
                  {progress.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      <strong>{error.field}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              )}

              {progress.completed === progress.total && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>
                      {t.ui.translation_completed} {progress.total - progress.errors.length} z {progress.total} {t.ui.successful_translations}.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkTranslateSection;