import React, { useState } from 'react';

interface BulkTranslateProps {
  formData: Record<string, any>;
  onFieldsUpdated: (updates: Record<string, string>) => void;
  disabled?: boolean;
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'Angličtina', flag: '🇺🇸' },
  { code: 'de', name: 'Nemčina', flag: '🇩🇪' },
  { code: 'it', name: 'Taliančina', flag: '🇮🇹' },
  { code: 'fr', name: 'Francúzština', flag: '🇫🇷' },
  { code: 'es', name: 'Španielčina', flag: '🇪🇸' },
  { code: 'pt', name: 'Portugalčina', flag: '🇵🇹' },
  { code: 'pl', name: 'Poľština', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', name: 'Maďarčina', flag: '🇭🇺' },
  { code: 'hr', name: 'Chorvátčina', flag: '🇭🇷' },
];

// Polia ktoré sa majú preložiť hromadne
const TRANSLATABLE_FIELDS = [
  { key: 'hlava', label: 'Nadpis', type: 'hlava' },
  { key: 'lectio_text', label: 'Lectio text', type: 'spiritual' },
  { key: 'meditatio_text', label: 'Meditatio text', type: 'spiritual' },
  { key: 'oratio_text', label: 'Oratio text', type: 'spiritual' },
  { key: 'contemplatio_text', label: 'Contemplatio text', type: 'spiritual' },
  { key: 'actio_text', label: 'Actio text', type: 'spiritual' },
  { key: 'reference', label: 'Reference', type: 'reference' },
  { key: 'modlitba_zaver', label: 'Modlitba záver', type: 'prayer' }
];

interface TranslationProgress {
  total: number;
  completed: number;
  current: string;
  errors: Array<{ field: string; error: string }>;
}

export default function BulkTranslateSection({ formData, onFieldsUpdated, disabled = false }: BulkTranslateProps) {
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

    const languageInfo = AVAILABLE_LANGUAGES.find(lang => lang.code === selectedLanguage);
    if (!languageInfo) return;

    // Filtrovať len polia s textom
    const fieldsToTranslate = TRANSLATABLE_FIELDS.filter(field => {
      const text = formData[field.key];
      return text && typeof text === 'string' && text.trim().length > 0;
    });

    if (fieldsToTranslate.length === 0) {
      setGlobalError('Žiadne polia s textom na preloženie');
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
          text,
          field.type,
          languageInfo.name
        );
        translations[field.key] = translatedText;
      } catch (error: any) {
        console.error(`Translation error for ${field.key}:`, error);
        errors.push({
          field: field.label,
          error: error.message || 'Neznáma chyba'
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
      current: 'Dokončené',
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

  const fieldsWithText = TRANSLATABLE_FIELDS.filter(field => {
    const text = formData[field.key];
    return text && typeof text === 'string' && text.trim().length > 0;
  });

  const hasTextToTranslate = fieldsWithText.length > 0;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">🌍</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Hromadný preklad obsahu
            </h3>
            <p className="text-sm text-gray-600">
              Preloží všetky textové polia naraz do vybraného jazyka
            </p>
          </div>
        </div>
        <div className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
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
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">🚀</span>
              {isTranslating ? 'Prekladám...' : 'Spustiť hromadný preklad'}
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
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`
                        flex items-center px-3 py-2 text-sm rounded-lg border
                        ${selectedLanguage === lang.code
                          ? 'bg-purple-100 border-purple-300 text-purple-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }
                      `}
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
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span className="font-semibold">Prebieha preklad...</span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Aktuálne: {progress.current}</span>
                  <span>{progress.completed}/{progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
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
                      Preklad dokončený! {progress.total - progress.errors.length} z {progress.total} polí úspešne preložených.
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
}