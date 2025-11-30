import { useState } from 'react';

interface TranslateButtonProps {
  text: string;
  fieldType?: string;
  targetLanguage?: string; // Automaticky prekladať do tohto jazyka (en, es, cs, atď.)
  onTranslated: (translatedText: string) => void;
  disabled?: boolean;
  iconOnly?: boolean; // Zobrazovať len ikonu bez textu
  className?: string;
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

export default function TranslateButton({ 
  text, 
  fieldType, 
  targetLanguage,
  onTranslated, 
  disabled = false,
  iconOnly = false,
  className = "" 
}: TranslateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async (targetLang: string) => {
    if (!text.trim()) {
      setError("Žiadny text na preloženie");
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          targetLanguage: targetLang, // Posielame kód jazyka (en, cs, es)
          fieldType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Chyba ${response.status}`);
      }

      onTranslated(data.translatedText);
      setIsOpen(false);
      
    } catch (error: unknown) {
      console.error('Translation error:', error);
      setError(error instanceof Error ? error.message : 'Chyba pri preklade');
    } finally {
      setIsTranslating(false);
    }
  };

  const isTextEmpty = !text || text.trim().length === 0;

  // Ak je nastavený targetLanguage, prekladaj priamo bez výberu
  const handleButtonClick = () => {
    if (targetLanguage) {
      handleTranslate(targetLanguage);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled || isTextEmpty || isTranslating}
        className={iconOnly 
          ? `p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ${className}` 
          : `admin-edit-button-primary text-sm ${className}`}
        title={isTextEmpty ? "Najprv zadajte text" : targetLanguage ? `Preložiť do ${targetLanguage}` : "Preložiť text"}
      >
        {isTranslating ? (
          iconOnly ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
              Prekladám...
            </>
          )
        ) : (
          iconOnly ? (
            <span className="text-lg">🌐</span>
          ) : (
            <>
              <span className="mr-2">🌐</span>
              Preložiť
            </>
          )
        )}
      </button>

      {/* Dropdown s jazykmi - zobraz len ak nie je nastavený targetLanguage */}
      {isOpen && !isTextEmpty && !targetLanguage && (
        <div className="absolute z-50 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              Vybrať jazyk prekladu:
            </div>
            <div className="max-h-64 overflow-y-auto">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleTranslate(lang.code)}
                  disabled={isTranslating}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-3 text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
            
            {error && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                {error}
              </div>
            )}
            
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
              className="mt-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border-t border-gray-200"
            >
              Zrušiť
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
        />
      )}
    </div>
  );
}