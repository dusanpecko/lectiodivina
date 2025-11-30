"use client";

import { useSupabase } from "@/app/components/SupabaseProvider";
import { AlertCircle, BookOpen, CheckCircle, Copy, Globe, Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Translation {
  id: number;
  code: string;
  name: string;
  locale_id: number;
}

interface Book {
  id: number;
  code: string;
  name: string;
  full_name: string;
  order_number: number;
  locale_id: number;
}

interface BulkLanguageMigrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted: () => void;
  sourceLang: string;
  availableLanguages: Array<{ value: string; label: string; flag: string }>;
}

const LoadingSpinner = ({ size = 6 }: { size?: number }) => (
  <div className={`w-${size} h-${size} border-2 border-t-transparent rounded-full animate-spin`} style={{ borderColor: '#40467b', borderTopColor: 'transparent' }} />
);

export default function BulkLanguageMigrationDialog({
  isOpen,
  onClose,
  onCompleted,
  sourceLang,
  availableLanguages
}: BulkLanguageMigrationDialogProps) {
  const { supabase } = useSupabase();

  // State
  const [targetLang, setTargetLang] = useState<string>("");
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedBiblia1, setSelectedBiblia1] = useState<string>("");
  const [selectedBiblia2, setSelectedBiblia2] = useState<string>("");
  const [selectedBiblia3, setSelectedBiblia3] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  
  // Migration state
  const [migrationInProgress, setMigrationInProgress] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [phaseMessage, setPhaseMessage] = useState("");

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTargetLang("");
      setSelectedBiblia1("");
      setSelectedBiblia2("");
      setSelectedBiblia3("");
      setTranslations([]);
      setBooks([]);
      setMigrationInProgress(false);
      setCurrentPhase(0);
      setCurrentProgress(0);
      setTotalRecords(0);
      setPhaseMessage("");
    }
  }, [isOpen]);

  // Load translations and books when target language is selected
  const loadTargetLanguageData = useCallback(async (lang: string) => {
    setLoadingTranslations(true);
    try {
      // Load locale
      const { data: localeData, error: localeError } = await supabase
        .from('locales')
        .select('id, code, name')
        .eq('code', lang)
        .eq('is_active', true)
        .single();

      if (localeError || !localeData) {
        throw new Error(`Jazyk ${lang} nebol nájdený`);
      }

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
          const firstId = translationsData[0].id.toString();
          setSelectedBiblia1(firstId);
          setSelectedBiblia2(firstId);
          setSelectedBiblia3(firstId);
        }
      }

      // Load books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('id, code, name, full_name, order_number, locale_id')
        .eq('locale_id', localeData.id)
        .eq('is_active', true)
        .order('order_number');

      if (!booksError && booksData) {
        setBooks(booksData);
      }
    } catch (error) {
      console.error('Chyba pri načítaní dát pre cieľový jazyk:', error);
      alert('Chyba pri načítaní prekladov pre vybraný jazyk');
    }
    setLoadingTranslations(false);
  }, [supabase]);

  useEffect(() => {
    if (targetLang) {
      loadTargetLanguageData(targetLang);
    }
  }, [targetLang, loadTargetLanguageData]);

  // Parse bible reference
  const parseBibleReference = (reference: string): { bookCode: string; chapter: number; verseSpec: string } | null => {
    const trimmed = reference.trim();
    const match = trimmed.match(/^(\d?\s*[A-Za-zÁ-žĀ-žà-ÿ]+\.?)\s*(\d+)\s*,\s*(.+)$/);
    
    if (!match) return null;
    
    const bookCode = match[1].trim().replace(/\s+/g, '');
    const chapter = parseInt(match[2]);
    const verseSpec = match[3].trim();
    
    return { bookCode, chapter, verseSpec };
  };

  // Parse verse specification
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

  // Generate Bible text for a given translation and reference
  const generateBibleText = async (
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

      const filteredVerses = verses.filter((v: {verse: number}) => {
        return verseRanges.some(([start, end]) => v.verse >= start && v.verse <= end);
      });

      if (filteredVerses.length === 0) return '';

      return filteredVerses.map((v: {verse: number, text: string}) => `${v.verse} ${v.text}`).join(' ');
    } catch (error) {
      console.warn(`Chyba pri načítaní veršov pre ${suradnice}:`, error);
      return '';
    }
  };

  // Translate text using API
  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage,
          fieldType: 'hlava'
        })
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.warn('Translation error:', error);
      return text; // Return original if translation fails
    }
  };

  // Main migration function
  const executeMigration = async () => {
    if (!targetLang || !selectedBiblia1 || !selectedBiblia2 || !selectedBiblia3) {
      alert('Vyplňte všetky požadované polia');
      return;
    }

    setMigrationInProgress(true);
    setCurrentPhase(1);
    setCurrentProgress(0);

    try {
      // PHASE 1: Fetch all source records
      setPhaseMessage("Načítavam zdrojové záznamy...");
      const { data: sourceRecords, error: fetchError } = await supabase
        .from('lectio_sources')
        .select('*')
        .eq('lang', sourceLang)
        .order('id', { ascending: true });

      if (fetchError || !sourceRecords) {
        throw new Error('Chyba pri načítaní zdrojových záznamov');
      }

      setTotalRecords(sourceRecords.length);

      if (sourceRecords.length === 0) {
        alert('Žiadne záznamy na kopírovanie');
        setMigrationInProgress(false);
        return;
      }

      // PHASE 2: Copy records
      setCurrentPhase(2);
      setPhaseMessage("Kopírujem záznamy...");
      
      const BATCH_SIZE = 10;
      const newRecordIds: number[] = [];

      for (let i = 0; i < sourceRecords.length; i += BATCH_SIZE) {
        const batch = sourceRecords.slice(i, i + BATCH_SIZE);
        const newRecords = batch.map(record => ({
          lang: targetLang,
          kniha: record.kniha || "",
          kapitola: record.kapitola || "",
          hlava: record.hlava,
          rok: record.rok || "N",
          suradnice_pismo: record.suradnice_pismo,
          lectio_text: record.lectio_text || "",
          meditatio_text: record.meditatio_text || "",
          oratio_text: record.oratio_text || "",
          contemplatio_text: record.contemplatio_text || "",
          actio_text: record.actio_text || "",
          reference: record.reference || "",
          nazov_biblia_1: "",
          biblia_1: "",
          biblia_1_audio: "",
          nazov_biblia_2: "",
          biblia_2: "",
          biblia_2_audio: "",
          nazov_biblia_3: "",
          biblia_3: "",
          biblia_3_audio: "",
          lectio_audio: "",
          meditatio_audio: "",
          oratio_audio: "",
          contemplatio_audio: "",
          actio_audio: "",
          modlitba_zaver: "",
          audio_5_min: "",
          checked: 0
        }));

        const { data: insertedRecords, error: insertError } = await supabase
          .from('lectio_sources')
          .insert(newRecords)
          .select('id');

        if (insertError) {
          throw new Error(`Chyba pri kopírovaní: ${insertError.message}`);
        }

        if (insertedRecords) {
          newRecordIds.push(...insertedRecords.map(r => r.id));
        }

        setCurrentProgress(i + batch.length);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // PHASE 3: Translate titles
      setCurrentPhase(3);
      setPhaseMessage("Prekladám nadpisy...");
      setCurrentProgress(0);

      const { data: newRecords, error: fetchNewError } = await supabase
        .from('lectio_sources')
        .select('id, hlava, lang')
        .in('id', newRecordIds);

      if (fetchNewError || !newRecords) {
        throw new Error('Chyba pri načítaní nových záznamov');
      }

      for (let i = 0; i < newRecords.length; i++) {
        const record = newRecords[i];
        if (record.hlava) {
          const translatedTitle = await translateText(record.hlava, record.lang || targetLang);
          
          await supabase
            .from('lectio_sources')
            .update({ hlava: translatedTitle })
            .eq('id', record.id);
        }

        setCurrentProgress(i + 1);
        
        // Batch delay to avoid rate limiting
        if ((i + 1) % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // PHASE 4: Import Bible texts
      setCurrentPhase(4);
      setPhaseMessage("Importujem biblické texty...");
      setCurrentProgress(0);

      const { data: recordsForBible, error: fetchBibleError } = await supabase
        .from('lectio_sources')
        .select('id, suradnice_pismo')
        .in('id', newRecordIds);

      if (fetchBibleError || !recordsForBible) {
        throw new Error('Chyba pri načítaní záznamov pre Bible import');
      }

      const translationName1 = translations.find(t => t.id.toString() === selectedBiblia1)?.name || '';
      const translationName2 = translations.find(t => t.id.toString() === selectedBiblia2)?.name || '';
      const translationName3 = translations.find(t => t.id.toString() === selectedBiblia3)?.name || '';

      for (let i = 0; i < recordsForBible.length; i++) {
        const record = recordsForBible[i];
        
        if (record.suradnice_pismo) {
          const parsed = parseBibleReference(record.suradnice_pismo);
          if (parsed) {
            const book = books.find(b => 
              b.code.toLowerCase() === parsed.bookCode.toLowerCase()
            );

            if (book) {
              const [text1, text2, text3] = await Promise.all([
                generateBibleText(selectedBiblia1, record.suradnice_pismo, book),
                generateBibleText(selectedBiblia2, record.suradnice_pismo, book),
                generateBibleText(selectedBiblia3, record.suradnice_pismo, book)
              ]);

              await supabase
                .from('lectio_sources')
                .update({
                  nazov_biblia_1: text1 ? translationName1 : '',
                  biblia_1: text1,
                  nazov_biblia_2: text2 ? translationName2 : '',
                  biblia_2: text2,
                  nazov_biblia_3: text3 ? translationName3 : '',
                  biblia_3: text3
                })
                .eq('id', record.id);
            }
          }
        }

        setCurrentProgress(i + 1);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Success!
      setCurrentPhase(5);
      setPhaseMessage("Hotovo!");
      
      setTimeout(() => {
        alert(`Migrácia dokončená!\n\n✅ Skopírované: ${sourceRecords.length} záznamov\n✅ Preložené: ${newRecords.length} nadpisov\n✅ Importované: ${recordsForBible.length} biblických textov`);
        onCompleted();
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Migration error:', error);
      alert(`Chyba pri migrácii: ${error instanceof Error ? error.message : 'Neznáma chyba'}`);
      setMigrationInProgress(false);
    }
  };

  if (!isOpen) return null;

  const targetLanguageOption = availableLanguages.find(l => l.value === targetLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={migrationInProgress ? undefined : onClose} />
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Globe size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Hromadná migrácia jazyka</h2>
              <p className="text-orange-100 text-xs">Kopírovanie + Preklad + Bible Import</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!migrationInProgress ? (
            <>
              {/* Source Language */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Zdrojový jazyk:
                </label>
                <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
                  <span className="text-xl">
                    {availableLanguages.find(l => l.value === sourceLang)?.flag}
                  </span>
                  <span className="font-medium text-sm">
                    {availableLanguages.find(l => l.value === sourceLang)?.label || sourceLang.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Target Language */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cieľový jazyk:
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm"
                  disabled={loadingTranslations}
                >
                  <option value="">-- Vyberte cieľový jazyk --</option>
                  {availableLanguages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {loadingTranslations && (
                <div className="mb-4 flex items-center justify-center gap-2 text-gray-600 text-sm">
                  <LoadingSpinner size={4} />
                  <span>Načítavam preklady Biblie...</span>
                </div>
              )}

              {translations.length > 0 && (
                <>
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <BookOpen size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm mb-1">Výber prekladov Biblie</h4>
                        <p className="text-xs text-blue-700">
                          Vyberte preklady pre všetky tri biblické polia.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bible Translation Selectors */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        📖 Biblia 1:
                      </label>
                      <select
                        value={selectedBiblia1}
                        onChange={(e) => setSelectedBiblia1(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm"
                      >
                        <option value="">-- Vyberte preklad --</option>
                        {translations.map(trans => (
                          <option key={trans.id} value={trans.id.toString()}>
                            {trans.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        📖 Biblia 2:
                      </label>
                      <select
                        value={selectedBiblia2}
                        onChange={(e) => setSelectedBiblia2(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm"
                      >
                        <option value="">-- Vyberte preklad --</option>
                        {translations.map(trans => (
                          <option key={trans.id} value={trans.id.toString()}>
                            {trans.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        📖 Biblia 3:
                      </label>
                      <select
                        value={selectedBiblia3}
                        onChange={(e) => setSelectedBiblia3(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lime-500 focus:border-transparent transition text-sm"
                      >
                        <option value="">-- Vyberte preklad --</option>
                        {translations.map(trans => (
                          <option key={trans.id} value={trans.id.toString()}>
                            {trans.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-900 text-sm mb-1">Upozornenie</h4>
                        <p className="text-xs text-amber-700">
                          Táto operácia skopíruje <strong>VŠETKY</strong> záznamy z {sourceLang.toUpperCase()} 
                          do {targetLanguageOption?.label}, automaticky ich preloží a naimportuje biblické texty.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
                >
                  Zrušiť
                </button>
                <button
                  onClick={executeMigration}
                  disabled={!targetLang || !selectedBiblia1 || !selectedBiblia2 || !selectedBiblia3 || loadingTranslations}
                  className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg text-sm"
                >
                  <Copy size={18} />
                  Spustiť migráciu
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Migration Progress */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    {currentPhase === 5 ? (
                      <CheckCircle size={32} className="text-green-600" />
                    ) : (
                      <Loader size={32} className="text-orange-600 animate-spin" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {phaseMessage}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Fáza {currentPhase} z 4
                  </p>
                </div>

                {/* Progress Phases */}
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 p-2 rounded-lg ${currentPhase >= 2 ? 'bg-green-50' : currentPhase === 1 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                    {currentPhase > 2 ? (
                      <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                    ) : currentPhase === 2 ? (
                      <Loader size={18} className="text-orange-600 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-[18px] h-[18px] border-2 border-gray-300 rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">Kopírovanie záznamov</div>
                      {currentPhase === 2 && (
                        <div className="text-xs text-gray-600">
                          {currentProgress} / {totalRecords}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 p-2 rounded-lg ${currentPhase >= 4 ? 'bg-green-50' : currentPhase === 3 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                    {currentPhase > 3 ? (
                      <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                    ) : currentPhase === 3 ? (
                      <Loader size={18} className="text-orange-600 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-[18px] h-[18px] border-2 border-gray-300 rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">Preklad nadpisov</div>
                      {currentPhase === 3 && (
                        <div className="text-xs text-gray-600">
                          {currentProgress} / {totalRecords}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 p-2 rounded-lg ${currentPhase >= 5 ? 'bg-green-50' : currentPhase === 4 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                    {currentPhase > 4 ? (
                      <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                    ) : currentPhase === 4 ? (
                      <Loader size={18} className="text-orange-600 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-[18px] h-[18px] border-2 border-gray-300 rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">Import biblických textov</div>
                      {currentPhase === 4 && (
                        <div className="text-xs text-gray-600">
                          {currentProgress} / {totalRecords}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {currentPhase > 1 && currentPhase < 5 && totalRecords > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${(currentProgress / totalRecords) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
