"use client";

import { Check, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AITextFieldWithSuggestionsProps {
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
  className?: string;
}

interface AISuggestion {
  text: string;
  tokens: number;
}

export default function AITextFieldWithSuggestions({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 10,
  height = '15rem',
  fieldType = 'spiritual',
  disabled = false,
  className = ''
}: AITextFieldWithSuggestionsProps) {
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced AI suggestion
  useEffect(() => {
    // Vyčisti predchádzajúci timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Vyčisti existujúce návrhy
    setSuggestion(null);
    setError(null);

    // Ak je text príliš krátky, nepýtaj AI
    if (value.length < 100) {
      setLoading(false);
      return;
    }

    // Ak používateľ prestal písať, čakaj 2.5s a potom spýtaj AI
    setLoading(true);
    
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
        setError(err instanceof Error ? err.message : 'Chyba pri AI návrhu');
      } finally {
        setLoading(false);
      }
    }, 2500); // Počkaj 2.5s po zastavení písania

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, fieldType]);

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
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      
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

        {/* Loading indicator */}
        {loading && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
            <div className="animate-spin w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full" />
            <span className="text-xs text-gray-600">AI navrhuje...</span>
          </div>
        )}

        {/* AI Suggestion Popup */}
        {suggestion && !loading && (
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

        {/* Error message */}
        {error && (
          <div className="absolute bottom-4 right-4 left-4 bg-red-50 border border-red-200 rounded-lg p-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-800">{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info text */}
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
    </div>
  );
}
