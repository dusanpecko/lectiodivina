"use client";

import { useSupabase } from "@/app/components/SupabaseProvider";
import { AlertCircle, BookOpen, CheckCircle, Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Interfaces
interface Locale {
  id: number;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
}

interface Translation {
  id: number;
  code: string;
  name: string;
  locale_id: number;
  year_published?: number;
  publisher?: string;
  is_active?: boolean;
}

interface Book {
  id: number;
  code: string;
  name: string;
  full_name: string;
  order_number: number;
  locale_id: number;
  testament?: string;
  is_active?: boolean;
}



interface ImportSuggestion {
  lectioId: number;
  lectioTitle: string;
  suradnice: string;
  availableFields: Array<{field: 'biblia_1' | 'biblia_2' | 'biblia_3', nameField: 'nazov_biblia_1' | 'nazov_biblia_2' | 'nazov_biblia_3'}>;
  selectedTargetField: 'biblia_1' | 'biblia_2' | 'biblia_3';
  selectedTargetNameField: 'nazov_biblia_1' | 'nazov_biblia_2' | 'nazov_biblia_3';
  selectedTranslation: string;
  suggestedText: string;
  suggestedName: string;
  bookMatch: Book | null;
}

interface BulkBibleImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportsCompleted: () => void;
  currentLang: string;
}

// Loading komponenta
const LoadingSpinner = ({ size = 6 }: { size?: number }) => (
  <div className={`w-${size} h-${size} border-2 border-t-transparent rounded-full animate-spin`} style={{ borderColor: '#40467b', borderTopColor: 'transparent' }} />
);

export default function BulkBibleImportModal({ 
  isOpen, 
  onClose, 
  onImportsCompleted,
  currentLang 
}: BulkBibleImportModalProps) {
  const { supabase } = useSupabase();
  
  // State
  const [loading, setLoading] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);
  const [suggestions, setSuggestions] = useState<ImportSuggestion[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(-1);

  const loadLocaleAndTranslationsCallback = useCallback(async () => {
    setLoading(true);
    try {
      // Load locale
      const { data: localeData, error: localeError } = await supabase
        .from('locales')
        .select('id, code, name, native_name, is_active')
        .eq('code', currentLang)
        .eq('is_active', true)
        .single();

      if (localeError || !localeData) {
        throw new Error(`Jazyk ${currentLang} nebol nájdený`);
      }

      setCurrentLocale(localeData);

      // Load translations for this locale
      const { data: translationsData, error: translationsError } = await supabase
        .from('translations')
        .select('id, code, name, locale_id')
        .eq('locale_id', localeData.id)
        .eq('is_active', true)
        .order('name');

      if (!translationsError && translationsData) {
        setTranslations(translationsData);
        // Auto-select first translation if available
        if (translationsData.length > 0) {
          setSelectedTranslation(translationsData[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Chyba pri načítaní jazykov a prekladov:', error);
    }
    setLoading(false);
  }, [supabase, currentLang]);

  const loadBooksCallback = useCallback(async () => {
    if (!currentLocale) return;
    
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, code, name, full_name, order_number, locale_id')
        .eq('locale_id', currentLocale.id)
        .eq('is_active', true)
        .order('order_number');

      if (!error && data) {
        setBooks(data);
      }
    } catch (error) {
      console.error('Chyba pri načítaní kníh:', error);
    }
  }, [supabase, currentLocale]);

  // Load locale and translations on open
  useEffect(() => {
    if (isOpen && currentLang) {
      loadLocaleAndTranslationsCallback();
    }
  }, [isOpen, currentLang, loadLocaleAndTranslationsCallback]);

  // Load books when translation is selected
  useEffect(() => {
    if (selectedTranslation && currentLocale) {
      loadBooksCallback();
    }
  }, [selectedTranslation, currentLocale, loadBooksCallback]);



  // Parse bible reference like "Mt 5,1-12" or "Lk 23, 35-43"
  const parseBibleReference = (reference: string): { bookCode: string; chapter: number; verseSpec: string } | null => {
    const trimmed = reference.trim();
    const match = trimmed.match(/^(\d?\s*[A-Za-zÁ-žĀ-žà-ÿ]+\.?)\s*(\d+)\s*,\s*(.+)$/);
    
    if (!match) return null;
    
    const bookCode = match[1].trim().replace(/\s+/g, '');
    const chapter = parseInt(match[2]);
    const verseSpec = match[3].trim();
    
    return { bookCode, chapter, verseSpec };
  };

  // Parse verse specification like "1-12" or "35-43"
  const parseVerseSpec = (specRaw: string): Array<[number, number]> => {
    const spec = specRaw.replace(/\s+/g, " ").replace(/\s*;\s*/g, ".").trim();
    if (!spec) return [];

    const parts = spec.split(".").map((p) => p.trim()).filter(Boolean);
    const ranges: Array<[number, number]> = [];

    for (const part of parts) {
      const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!m) continue;
      let a = parseInt(m[1], 10);
      let b = m[2] ? parseInt(m[2], 10) : a;
      if (a > b) [a, b] = [b, a];
      ranges.push([a, b]);
    }
    return ranges;
  };

  const generateTextForTranslationAndReference = async (
    translationId: string, 
    suradnice: string, 
    bookMatch: Book
  ): Promise<string> => {
    const parsed = parseBibleReference(suradnice);
    if (!parsed) return '';

    const verseRanges = parseVerseSpec(parsed.verseSpec);
    if (verseRanges.length === 0) return '';

    try {
      const { data: verses, error: versesError } = await supabase
        .from('bible_verses')
        .select('id, chapter, verse, text')
        .eq('book_id', bookMatch.id)
        .eq('translation_id', parseInt(translationId))
        .eq('chapter', parsed.chapter)
        .eq('is_active', true)
        .order('verse');

      if (versesError || !verses || verses.length === 0) return '';

      // Filter verses by ranges
      const filteredVerses = verses.filter((v: {verse: number}) => {
        return verseRanges.some(([start, end]) => v.verse >= start && v.verse <= end);
      });

      if (filteredVerses.length === 0) return '';

      // Create verse text
      return filteredVerses.map((v: {verse: number, text: string}) => `${v.verse} ${v.text}`).join(' ');
    } catch (error) {
      console.warn(`Chyba pri načítaní veršov pre ${suradnice}:`, error);
      return '';
    }
  };

  const scanForImportOpportunities = async () => {
    if (!selectedTranslation || !currentLocale) return;

    setLoading(true);
    setSuggestions([]);

    try {
      // Get all lectio sources for current language with empty bible fields
      const { data: lectioSources, error: lectioError } = await supabase
        .from('lectio_sources')
        .select('id, lang, hlava, suradnice_pismo, nazov_biblia_1, biblia_1, nazov_biblia_2, biblia_2, nazov_biblia_3, biblia_3')
        .eq('lang', currentLang)
        .order('id');

      if (lectioError || !lectioSources) {
        throw new Error('Chyba pri načítaní Lectio zdrojov');
      }

      const importSuggestions: ImportSuggestion[] = [];

      for (const lectio of lectioSources) {
        if (!lectio.suradnice_pismo) continue;

        // Check which bible fields are empty
        const emptyFields: Array<{field: 'biblia_1' | 'biblia_2' | 'biblia_3', nameField: 'nazov_biblia_1' | 'nazov_biblia_2' | 'nazov_biblia_3'}> = [];
        
        if (!lectio.biblia_1 || !lectio.nazov_biblia_1) {
          emptyFields.push({field: 'biblia_1', nameField: 'nazov_biblia_1'});
        }
        if (!lectio.biblia_2 || !lectio.nazov_biblia_2) {
          emptyFields.push({field: 'biblia_2', nameField: 'nazov_biblia_2'});
        }
        if (!lectio.biblia_3 || !lectio.nazov_biblia_3) {
          emptyFields.push({field: 'biblia_3', nameField: 'nazov_biblia_3'});
        }

        if (emptyFields.length === 0) continue;

        // Try to parse the bible reference
        const parsed = parseBibleReference(lectio.suradnice_pismo);
        if (!parsed) continue;

        // Find matching book
        const book = books.find(b => 
          b.code.toLowerCase() === parsed.bookCode.toLowerCase()
        );
        if (!book) continue;

        // Generate text for the default translation
        const suggestedText = await generateTextForTranslationAndReference(
          selectedTranslation, 
          lectio.suradnice_pismo, 
          book
        );

        if (!suggestedText) continue;

        const translation = translations.find(t => t.id.toString() === selectedTranslation);
        const firstEmptyField = emptyFields[0];

        importSuggestions.push({
          lectioId: lectio.id,
          lectioTitle: lectio.hlava,
          suradnice: lectio.suradnice_pismo,
          availableFields: emptyFields,
          selectedTargetField: firstEmptyField.field,
          selectedTargetNameField: firstEmptyField.nameField,
          selectedTranslation: selectedTranslation,
          suggestedText: suggestedText,
          suggestedName: translation?.name || '',
          bookMatch: book
        });
      }

      setSuggestions(importSuggestions);
    } catch (error) {
      console.error('Chyba pri skenovaní:', error);
    }
    setLoading(false);
  };

  const executeImports = async (selectedSuggestions: ImportSuggestion[]) => {
    setProcessing(true);
    setCurrentProcessingIndex(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < selectedSuggestions.length; i++) {
      setCurrentProcessingIndex(i);
      const suggestion = selectedSuggestions[i];

      try {
        const { error } = await supabase
          .from('lectio_sources')
          .update({
            [suggestion.selectedTargetField]: suggestion.suggestedText,
            [suggestion.selectedTargetNameField]: suggestion.suggestedName
          })
          .eq('id', suggestion.lectioId);

        if (error) {
          throw error;
        }

        successCount++;
      } catch (error) {
        console.error(`Chyba pri importe pre ID ${suggestion.lectioId}:`, error);
        errorCount++;
      }

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setProcessing(false);
    setCurrentProcessingIndex(-1);

    // Show results and close
    alert(`Import dokončený!\nÚspešne: ${successCount}\nChyby: ${errorCount}`);
    onImportsCompleted();
    onClose();
  };

  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<Set<number>>(new Set());

  const toggleSuggestion = (lectioId: number) => {
    setSelectedSuggestionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lectioId)) {
        newSet.delete(lectioId);
      } else {
        newSet.add(lectioId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedSuggestionIds(new Set(suggestions.map(s => s.lectioId)));
  };

  const selectNone = () => {
    setSelectedSuggestionIds(new Set());
  };

  const updateSuggestionTargetField = (lectioId: number, fieldIndex: number) => {
    setSuggestions(prev => prev.map(suggestion => {
      if (suggestion.lectioId === lectioId) {
        const selectedField = suggestion.availableFields[fieldIndex];
        return {
          ...suggestion,
          selectedTargetField: selectedField.field,
          selectedTargetNameField: selectedField.nameField
        };
      }
      return suggestion;
    }));
  };

  const updateSuggestionTranslation = async (lectioId: number, translationId: string) => {
    const suggestion = suggestions.find(s => s.lectioId === lectioId);
    if (!suggestion || !suggestion.bookMatch) return;

    const translation = translations.find(t => t.id.toString() === translationId);
    if (!translation) return;

    // Generate new text for the selected translation
    const newText = await generateTextForTranslationAndReference(
      translationId,
      suggestion.suradnice,
      suggestion.bookMatch
    );

    setSuggestions(prev => prev.map(s => {
      if (s.lectioId === lectioId) {
        return {
          ...s,
          selectedTranslation: translationId,
          suggestedText: newText,
          suggestedName: translation.name
        };
      }
      return s;
    }));
  };

  // === Odstránenie čísiel veršov ===
  const stripVerseNumbers = (text: string) => {
    let out = text;
    // Odstráni samostatné čísla veršov (1–3 cifry) na začiatkoch úsekov alebo po interpunkcii/medzere.
    out = out.replace(/(^|[^\p{L}\p{N}])\s*\d{1,3}(?=\s)/gmu, (_m, p1) => (p1 || ""));
    // Zlúči viacnásobné medzery
    out = out.replace(/\s{2,}/g, " ");
    // Opraví medzeru pred interpunkciou
    out = out.replace(/\s+([,.;:!?])/g, "$1");
    return out.trim();
  };

  const handleStripVerseNumbers = (lectioId: number) => {
    setSuggestions(prev => prev.map(suggestion => {
      if (suggestion.lectioId === lectioId) {
        const cleanedText = stripVerseNumbers(suggestion.suggestedText);
        return {
          ...suggestion,
          suggestedText: cleanedText
        };
      }
      return suggestion;
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📥</span>
              <div>
                <h2 className="text-xl font-semibold">Hromadný import biblických textov</h2>
                <p className="text-sm text-indigo-100 mt-1">
                  Automaticky vyplní prázdne biblické polia na základe súradníc
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
              disabled={processing}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600">Načítavam...</span>
            </div>
          )}

          {!loading && !currentLocale && (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
              <p className="text-gray-600">Nepodarilo sa načítať jazyk {currentLang}</p>
            </div>
          )}

          {!loading && currentLocale && (
            <>
              {/* Translation selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preklad Biblie
                </label>
                <select
                  value={selectedTranslation}
                  onChange={(e) => setSelectedTranslation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b]"
                  disabled={processing}
                >
                  <option value="">-- Vyberte preklad --</option>
                  {translations.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Scan button */}
              {selectedTranslation && suggestions.length === 0 && (
                <div className="text-center py-6">
                  <button
                    onClick={scanForImportOpportunities}
                    disabled={loading || processing}
                    className="px-6 py-3 bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white rounded-lg hover:from-[#686ea3] hover:to-[#40467b] transition disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                  >
                    <BookOpen size={20} />
                    Skenovať Lectio zdroje
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Nájde všetky prázdne biblické polia, ktoré možno automaticky vyplniť
                  </p>
                </div>
              )}

              {/* Suggestions list */}
              {suggestions.length > 0 && !processing && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Nájdených {suggestions.length} príležitostí na import
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAll}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                      >
                        Vybrať všetko
                      </button>
                      <button
                        onClick={selectNone}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                      >
                        Zrušiť výber
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                    {suggestions.map((suggestion) => (
                      <div 
                        key={`${suggestion.lectioId}-${suggestion.selectedTargetField}`}
                        className={`border rounded-lg p-4 transition-all ${
                          selectedSuggestionIds.has(suggestion.lectioId)
                            ? 'border-[#40467b] bg-indigo-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedSuggestionIds.has(suggestion.lectioId)}
                            onChange={() => toggleSuggestion(suggestion.lectioId)}
                            className="mt-1 w-4 h-4 rounded focus:ring-2"
                            style={{'--tw-ring-color': '#40467b', color: '#40467b'} as React.CSSProperties}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="font-medium text-gray-900 truncate">
                                {suggestion.lectioTitle}
                              </h4>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {suggestion.suradnice}
                              </span>
                            </div>
                            
                            {/* Target field selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Cieľové pole:
                                </label>
                                <select
                                  value={suggestion.availableFields.findIndex(f => f.field === suggestion.selectedTargetField)}
                                  onChange={(e) => updateSuggestionTargetField(suggestion.lectioId, parseInt(e.target.value))}
                                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-[#40467b]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {suggestion.availableFields.map((field, index) => (
                                    <option key={field.field} value={index}>
                                      {field.field} ({field.field === 'biblia_1' ? 'Prvá Biblia' : 
                                        field.field === 'biblia_2' ? 'Druhá Biblia' : 'Tretia Biblia'})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              {/* Translation selection */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Preklad:
                                </label>
                                <select
                                  value={suggestion.selectedTranslation}
                                  onChange={(e) => updateSuggestionTranslation(suggestion.lectioId, e.target.value)}
                                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-[#40467b]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {translations.map(t => (
                                    <option key={t.id} value={t.id}>
                                      {t.name} ({t.code})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            
                            {/* Preview text */}
                            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-gray-300">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    → {suggestion.selectedTargetField}
                                  </span>
                                  <span className="text-xs font-medium text-gray-600">
                                    {suggestion.suggestedName}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStripVerseNumbers(suggestion.lectioId);
                                  }}
                                  className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded hover:bg-orange-200 transition-colors flex items-center gap-1"
                                  title="Odstráni čísla veršov (1, 7, 8, 9...)"
                                >
                                  🧹 Odstrániť čísla
                                </button>
                              </div>
                              <div className="text-sm">
                                {suggestion.suggestedText.length > 200 
                                  ? `${suggestion.suggestedText.slice(0, 200)}...`
                                  : suggestion.suggestedText
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Zrušiť
                    </button>
                    <button
                      onClick={() => {
                        const selectedSuggestions = suggestions.filter(s => 
                          selectedSuggestionIds.has(s.lectioId)
                        );
                        if (selectedSuggestions.length === 0) {
                          alert('Vyberte aspoň jeden záznam na import');
                          return;
                        }
                        if (confirm(`Naozaj chcete importovať ${selectedSuggestions.length} biblických textov?`)) {
                          executeImports(selectedSuggestions);
                        }
                      }}
                      disabled={selectedSuggestionIds.size === 0}
                      className="px-6 py-2 bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white rounded-lg hover:from-[#686ea3] hover:to-[#40467b] transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <Download size={16} />
                      Importovať vybrané ({selectedSuggestionIds.size})
                    </button>
                  </div>
                </>
              )}

              {/* Processing state */}
              {processing && (
                <div className="text-center py-8">
                  <LoadingSpinner size={8} />
                  <p className="text-lg font-medium text-gray-800 mt-4">
                    Importujem biblické texty...
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Spracovávam {currentProcessingIndex + 1} z {suggestions.filter(s => selectedSuggestionIds.has(s.lectioId)).length} záznamov
                  </p>
                  <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto mt-4">
                    <div 
                      className="bg-gradient-to-r from-[#40467b] to-[#686ea3] h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((currentProcessingIndex + 1) / suggestions.filter(s => selectedSuggestionIds.has(s.lectioId)).length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* No suggestions found */}
              {selectedTranslation && suggestions.length === 0 && !loading && (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
                  <p className="text-lg font-medium text-gray-800">
                    Všetky biblické polia sú už vyplnené!
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Neboli nájdené žiadne prázdne biblické polia, ktoré by mohli byť automaticky vyplnené.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}