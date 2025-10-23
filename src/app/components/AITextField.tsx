"use client";

import { Check, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import SimpleRichTextEditor from "./SimpleRichTextEditor";
import TranslateButton from "./TranslateButton";

interface AITextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  height?: string;
  fieldType?: 'spiritual' | 'prayer' | 'reference' | 'bible';
  disabled?: boolean;
  showGrammarCheck?: boolean;
  showTranslate?: boolean;
  showCleanHtml?: boolean;
  onTranslated?: (translatedText: string) => void;
  onCleanHtml?: () => void;
  // New features
  enableAISuggestions?: boolean;
  enableRichText?: boolean;
}

interface AISuggestion {
  text: string;
  tokens: number;
}

export default function AITextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 10,
  height = '15rem',
  fieldType = 'spiritual',
  disabled = false,
  showGrammarCheck = true,
  showTranslate = true,
  showCleanHtml = true,
  onTranslated,
  onCleanHtml,
  enableAISuggestions = false,
  enableRichText = false,
}: AITextFieldProps) {
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  
  // AI Suggestions state
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Toggle between plain text and rich text mode
  const [useRichText, setUseRichText] = useState(false);

  const handleGrammarCheck = async () => {
    if (!value || !value.trim()) {
      setCheckMessage('Pole je prázdne');
      setTimeout(() => setCheckMessage(null), 2000);
      return;
    }

    setChecking(true);
    setCheckMessage(null);

    try {
      const response = await fetch('/api/check-grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value, fieldType }),
      });

      const result = await response.json();

      if (result.success) {
        onChange(result.data.corrected_text);
        setCheckMessage(result.data.changes_made);
        setTimeout(() => setCheckMessage(null), 4000);
      } else {
        setCheckMessage('Chyba pri kontrole');
        setTimeout(() => setCheckMessage(null), 3000);
      }
    } catch (error) {
      console.error('Grammar check error:', error);
      setCheckMessage('Chyba pri kontrole');
      setTimeout(() => setCheckMessage(null), 3000);
    } finally {
      setChecking(false);
    }
  };

  const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    
    const htmlEntities: { [key: string]: string } = {
      '&scaron;': 'š', '&Scaron;': 'Š', '&ccaron;': 'č', '&Ccaron;': 'Č',
      '&zcaron;': 'ž', '&Zcaron;': 'Ž', '&yacute;': 'ý', '&Yacute;': 'Ý',
      '&aacute;': 'á', '&Aacute;': 'Á', '&eacute;': 'é', '&Eacute;': 'É',
      '&iacute;': 'í', '&Iacute;': 'Í', '&oacute;': 'ó', '&Oacute;': 'Ó',
      '&uacute;': 'ú', '&Uacute;': 'Ú', '&rcaron;': 'ŕ', '&Rcaron;': 'Ŕ',
      '&lcaron;': 'ľ', '&Lcaron;': 'Ľ', '&ncaron;': 'ň', '&Ncaron;': 'Ň',
      '&tcaron;': 'ť', '&Tcaron;': 'Ť', '&dcaron;': 'ď', '&Dcaron;': 'Ď',
      '&ocirc;': 'ô', '&Ocirc;': 'Ô', '&acirc;': 'â', '&Acirc;': 'Â',
      '&ecirc;': 'ê', '&Ecirc;': 'Ê', '&icirc;': 'î', '&Icirc;': 'Î',
      '&ucirc;': 'û', '&Ucirc;': 'Û', '&nbsp;': ' ', '&amp;': '&',
      '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
      '&hellip;': '...', '&mdash;': '—', '&ndash;': '–',
      '&ldquo;': '"', '&rdquo;': '"', '&lsquo;': "'", '&rsquo;': "'"
    };

    let cleanText = html;
    Object.keys(htmlEntities).forEach(entity => {
      const regex = new RegExp(entity, 'gi');
      cleanText = cleanText.replace(regex, htmlEntities[entity]);
    });
    
    cleanText = cleanText.replace(/<[^>]*>/g, '');
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    return cleanText;
  };

  const handleCleanHtml = () => {
    if (!value || !value.trim()) {
      setCheckMessage('Pole je prázdne');
      setTimeout(() => setCheckMessage(null), 2000);
      return;
    }

    const cleanedValue = stripHtmlTags(value);
    if (cleanedValue === value) {
      setCheckMessage('Pole už neobsahuje HTML tagy');
      setTimeout(() => setCheckMessage(null), 2000);
      return;
    }

    onChange(cleanedValue);
    setCheckMessage('HTML vyčistené');
    setTimeout(() => setCheckMessage(null), 2000);
    
    if (onCleanHtml) onCleanHtml();
  };

  // AI Suggestions - Debounced
  useEffect(() => {
    if (!enableAISuggestions || useRichText) return; // Disable AI suggestions in rich text mode

    // Vyčisti predchádzajúci timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Vyčisti existujúce návrhy
    setSuggestion(null);
    setSuggestionError(null);

    // Ak je text príliš krátky, nepýtaj AI
    if (value.length < 100) {
      setLoadingSuggestion(false);
      return;
    }

    // Ak používateľ prestal písať, čakaj 2.5s a potom spýtaj AI
    setLoadingSuggestion(true);
    
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/ai-suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: value,
            fieldType,
            suggestionType: 'continuation'
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Chyba pri AI návrhu');
        }

        if (data.success && data.suggestion) {
          setSuggestion({
            text: data.suggestion,
            tokens: data.tokens
          });
        }
      } catch (err) {
        console.error('AI suggestion error:', err);
        setSuggestionError(err instanceof Error ? err.message : 'Chyba pri AI návrhu');
      } finally {
        setLoadingSuggestion(false);
      }
    }, 2500); // Počkaj 2.5s po zastavení písania

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, fieldType, enableAISuggestions, useRichText]);

  const acceptSuggestion = () => {
    if (suggestion) {
      // Pridaj medzeru pred návrhom ak tam nie je
      const currentValue = value.trimEnd();
      const newValue = currentValue + (currentValue.endsWith('.') || currentValue.endsWith('?') || currentValue.endsWith('!') 
        ? ' ' 
        : ' ') + suggestion.text;
      
      onChange(newValue);
      setSuggestion(null);
      
      // Fokus späť na textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const rejectSuggestion = () => {
    setSuggestion(null);
    setSuggestionError(null);
  };

  // If Rich Text Editor is enabled and user toggled it on, use that instead
  if (enableRichText && useRichText) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">
            <span className="mr-2">✨</span>
            Rich text režim aktívny
          </div>
          <button
            type="button"
            onClick={() => setUseRichText(false)}
            className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center gap-2"
          >
            <span>✏️</span>
            Prepnúť na AI návrhy
          </button>
        </div>
        <SimpleRichTextEditor
          label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          minHeight={height}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {checkMessage && (
            <span className="text-xs text-green-600 animate-fade-in">
              {checkMessage}
            </span>
          )}
          
          {/* Rich Text Toggle Button */}
          {enableRichText && (
            <button
              type="button"
              onClick={() => setUseRichText(true)}
              disabled={disabled}
              className="admin-edit-button-primary text-sm"
              title="Prepnúť na rich text formátovanie"
            >
              <span className="mr-2">🎨</span>
              Rich formátovanie
            </button>
          )}
          
          {showCleanHtml && (
            <button
              type="button"
              onClick={handleCleanHtml}
              disabled={disabled || !value}
              className="admin-edit-button-primary text-sm"
              title="Vyčistiť HTML tagy z tohto poľa"
            >
              <span className="mr-2">🧹</span>
              Vyčistiť HTML
            </button>
          )}
          
          {showTranslate && (
            <TranslateButton
              text={value}
              fieldType={fieldType}
              onTranslated={(translatedText) => {
                onChange(translatedText);
                if (onTranslated) onTranslated(translatedText);
              }}
              disabled={disabled}
            />
          )}
          
          {showGrammarCheck && (
            <button
              type="button"
              onClick={handleGrammarCheck}
              disabled={checking || disabled || !value}
              className="admin-edit-button-primary text-sm"
              title="Skontrolovať gramatiku a štýl s AI"
            >
              {checking ? (
                <>
                  <span className="mr-2">⏳</span>
                  Kontrolujem...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span>
                  Skontrolovať gramatiku
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-500"
          placeholder={placeholder}
          rows={rows}
          style={{ height }}
        />

        {/* AI Suggestions Loading indicator */}
        {enableAISuggestions && loadingSuggestion && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
            <div className="animate-spin w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full" />
            <span className="text-xs text-gray-600">AI navrhuje...</span>
          </div>
        )}

        {/* AI Suggestion Popup */}
        {enableAISuggestions && suggestion && !loadingSuggestion && (
          <div className="absolute bottom-4 right-4 left-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-4 shadow-xl animate-fade-in z-10">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-semibold text-purple-800">
                    💡 AI návrh pokračovania
                  </div>
                  <div className="text-xs text-gray-500">
                    {suggestion.tokens} tokenov
                  </div>
                </div>
                <div className="text-sm text-gray-700 italic leading-relaxed">
                  &quot;{suggestion.text}&quot;
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={acceptSuggestion}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Check size={16} />
                Použiť návrh
              </button>
              <button
                type="button"
                onClick={rejectSuggestion}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
              >
                <X size={16} />
                Zamietnuť
              </button>
            </div>
          </div>
        )}

        {/* AI Suggestion Error message */}
        {enableAISuggestions && suggestionError && (
          <div className="absolute bottom-4 right-4 left-4 bg-red-50 border border-red-200 rounded-lg p-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-800">{suggestionError}</span>
              <button
                type="button"
                onClick={() => setSuggestionError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info text for AI Suggestions */}
      {enableAISuggestions && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {value.length > 0 && `${value.length} znakov`}
            {value.length >= 100 && ' • AI návrhy aktívne'}
          </span>
          {value.length < 100 && value.length > 0 && (
            <span className="text-gray-400">
              Napíšte aspoň 100 znakov pre AI návrhy
            </span>
          )}
        </div>
      )}
    </div>
  );
}
