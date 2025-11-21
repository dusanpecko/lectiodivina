"use client";

import { useSupabase } from "@/app/components/SupabaseProvider";
import { AlertTriangle, ArrowLeft, BookOpen, CheckCircle, Upload } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Import admin CSS štýlov
import "../../admin-edit.css";

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

interface ParsedVerse {
  verse: number;
  text: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  skippedCount?: number;
  errors?: string[];
}

export default function BibleBulkImportEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? String(params.id) : "";
  const isNew = id === 'new';
  
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [locales, setLocales] = useState<Locale[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  
  const [selectedLocale, setSelectedLocale] = useState<string>("");
  const [selectedTranslation, setSelectedTranslation] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [parsedVerses, setParsedVerses] = useState<ParsedVerse[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Load locales on mount
  useEffect(() => {
    loadLocales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load translations when locale changes
  useEffect(() => {
    if (selectedLocale) {
      loadTranslations();
      setSelectedTranslation("");
      setSelectedBook("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocale]);

  // Load books when locale changes (books depend on locale, not translation)
  useEffect(() => {
    if (selectedLocale) {
      loadBooks();
      setSelectedBook("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocale]);

  // Parse text when input changes  
  useEffect(() => {
    if (inputText.trim()) {
      parseInputText();
    } else {
      setParsedVerses([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText]);

  const loadLocales = async () => {
    try {
      const { data, error } = await supabase
        .from('locales')
        .select('id, code, name, native_name, is_active')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setLocales(data);
        // Automaticky vyber slovenčinu ak existuje
        const slovak = data.find(l => l.code === 'sk');
        if (slovak) {
          setSelectedLocale(slovak.id.toString());
        }
      }
    } catch (error) {
      console.error('Chyba pri načítaní lokalít:', error);
    }
  };

  const loadTranslations = async () => {
    if (!selectedLocale) return;
    
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('id, code, name, locale_id, year_published, publisher')
        .eq('locale_id', selectedLocale)
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setTranslations(data);
        // Automaticky vyber SSV ak existuje
        const ssv = data.find(t => t.code.toLowerCase().includes('ssv') || t.name.toLowerCase().includes('ssv'));
        if (ssv) {
          setSelectedTranslation(ssv.id.toString());
        }
      }
    } catch (error) {
      console.error('Chyba pri načítaní prekladov:', error);
    }
  };

  const loadBooks = async () => {
    if (!selectedLocale) return;
    
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, code, name, full_name, order_number, locale_id')
        .eq('locale_id', selectedLocale)
        .eq('is_active', true)
        .order('order_number');

      if (!error && data) {
        setBooks(data);
        // Automaticky vyber Lukáš ak existuje
        const luke = data.find(b => 
          b.code.toLowerCase() === 'lk' || 
          b.code.toLowerCase() === 'luke' || 
          b.name.toLowerCase().includes('lukáš') ||
          b.name.toLowerCase().includes('lukas')
        );
        if (luke) {
          setSelectedBook(luke.id.toString());
        }
      }
    } catch (error) {
      console.error('Chyba pri načítaní kníh:', error);
    }
  };

  const parseInputText = () => {
    const text = inputText.trim();
    if (!text) {
      setParsedVerses([]);
      return;
    }

    const verses: ParsedVerse[] = [];
    
    // Rozdelíme text na riadky a pokúsime sa parsovať každý riadok
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Parsovanie viacerých veršov v jednom riadku
      // Použijeme regex na nájdenie všetkých výskytov čísla nasledovaného textom
      const verseMatches = trimmedLine.matchAll(/(\d+)\s+([^0-9]*?)(?=\s*\d+\s+|$)/g);
      
      let foundVerses = false;
      for (const match of verseMatches) {
        const verseNumber = parseInt(match[1]);
        const verseText = match[2].trim();
        
        if (verseNumber > 0 && verseText) {
          verses.push({
            verse: verseNumber,
            text: verseText
          });
          foundVerses = true;
        }
      }
      
      // Ak sme nenašli žiadne verše pomocou nového algoritmu, skúsime starý spôsob
      if (!foundVerses) {
        const singleVerseMatch = trimmedLine.match(/^(\d+)\s+(.+)$/);
        
        if (singleVerseMatch) {
          const verseNumber = parseInt(singleVerseMatch[1]);
          const verseText = singleVerseMatch[2].trim();
          
          if (verseNumber > 0 && verseText) {
            verses.push({
              verse: verseNumber,
              text: verseText
            });
          }
        } else {
          // Ak nemôžeme parsovať číslo verša, pridáme to ako poznámku
          console.warn('Nemožno parsovať riadok:', trimmedLine);
        }
      }
    }

    setParsedVerses(verses);
  };

  const handleImport = async () => {
    if (!selectedLocale || !selectedTranslation || !selectedBook || !selectedChapter || parsedVerses.length === 0) {
      alert('Prosím vyplňte všetky povinné polia a zadajte text na import.');
      return;
    }

    setLoading(true);
    setImportResult(null);

    try {
      const response = await fetch('/api/admin/bible-bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale_id: parseInt(selectedLocale),
          translation_id: parseInt(selectedTranslation),
          book_id: parseInt(selectedBook),
          chapter: parseInt(selectedChapter),
          verses: parsedVerses,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setImportResult(result);
        if (result.success) {
          // Vyčistíme formulár po úspešnom importe
          setInputText("");
          setParsedVerses([]);
        }
      } else {
        setImportResult({
          success: false,
          message: result.error || 'Nastala neočakávaná chyba pri importe.',
        });
      }
    } catch (error) {
      console.error('Chyba pri importe:', error);
      setImportResult({
        success: false,
        message: 'Nastala chyba pri komunikácii so serverom.',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/bible-bulk-import')}
          className="flex items-center gap-2 text-[#40467b] hover:text-[#686ea3] mb-6 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Späť na zoznam
        </button>

        {/* Header */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Upload size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    {isNew ? "Nový Bulk Import" : "Upraviť Bulk Import"}
                  </h1>
                  <p className="text-indigo-100 mt-1">Import celých kapitol do bible_verses tabuľky</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {/* Nastavenia importu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={20} className="text-[#40467b]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Nastavenia Importu</h2>
                  <p className="text-sm text-gray-600">Vyberte jazyk, preklad a knihu</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jazyk / Lokalita */}
              <div className="space-y-2">
                <label className="admin-edit-label">
                  <BookOpen size={16} />
                  Jazyk / Lokalita <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedLocale}
                  onChange={(e) => setSelectedLocale(e.target.value)}
                  className="admin-edit-input"
                >
                  <option value="">-- Vyberte jazyk --</option>
                  {locales.map(locale => (
                    <option key={locale.id} value={locale.id}>
                      {locale.native_name} ({locale.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preklad Biblie */}
              <div className="space-y-2">
                <label className="admin-edit-label">
                  <BookOpen size={16} />
                  Preklad Biblie <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTranslation}
                  onChange={(e) => setSelectedTranslation(e.target.value)}
                  disabled={!selectedLocale}
                  className="admin-edit-input disabled:bg-gray-100"
                >
                  <option value="">-- Vyberte preklad --</option>
                  {translations.map(translation => (
                    <option key={translation.id} value={translation.id}>
                      {translation.name} ({translation.code})
                      {translation.year_published && ` - ${translation.year_published}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kniha Biblie */}
              <div className="space-y-2">
                <label className="admin-edit-label">
                  <BookOpen size={16} />
                  Kniha Biblie <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  disabled={!selectedLocale}
                  className="admin-edit-input disabled:bg-gray-100"
                >
                  <option value="">-- Vyberte knihu --</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.name} ({book.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Číslo kapitoly */}
              <div className="space-y-2">
                <label className="admin-edit-label">
                  <BookOpen size={16} />
                  Číslo Kapitoly <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  placeholder="napr. 1"
                  className="admin-edit-input"
                />
              </div>
            </div>
            </div>
          </div>

          {/* Text na import */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Upload size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Text na Import</h2>
                  <p className="text-sm text-gray-600">Vložte biblické verše na import</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <BookOpen size={18} />
                    Podporované formáty:
                  </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• <strong>Jeden verš na riadok:</strong> &quot;1 text verša&quot;</li>
                  <li>• <strong>Viac veršov v riadku:</strong> &quot;1 text prvého verša 2 text druhého verša&quot;</li>
                  <li>• <strong>Kombinovaný formát:</strong> zmesitý</li>
                </ul>
              </div>

              <div className="space-y-2">
                <label className="admin-edit-label">
                  <Upload size={16} />
                  Vložte text biblických veršov
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Príklady formátov:

Jeden verš na riadok:
1 Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, ktoré sa u nás stali,
2 ako nám to podali tí, čo boli od začiatku očitými svedkami a služobníkmi slova,

Viac veršov v riadku:
1 Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, 2 ako nám to podali tí, čo boli od začiatku očitými svedkami,
3 predsa som aj ja uznal za dobré dôkladne a postupne prebádať všetko od začiatku a napísať ti, vznešený Teofil, 4 aby si poznal spoľahlivosť náuky, do ktorej ťa zasvätili.`}
                  rows={12}
                  className="admin-edit-input font-mono text-sm"
                />
              </div>

              {/* Tlačidlo importu */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleImport}
                  disabled={loading || parsedVerses.length === 0 || !selectedLocale || !selectedTranslation || !selectedBook || !selectedChapter}
                  className="bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Importujem...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      <span>Importovať Verše ({parsedVerses.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            </div>
          </div>

          {/* Náhľad parsovaných veršov */}
          {parsedVerses.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Náhľad Parsovaných Veršov</h2>
                    <p className="text-sm text-gray-600">{parsedVerses.length} veršov pripravených na import</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="max-h-96 overflow-y-auto space-y-3">
                {parsedVerses.map((verse, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-indigo-50/30 to-transparent rounded-lg border border-gray-200 hover:border-indigo-300 transition-all">
                    <div className="flex items-start space-x-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-50 text-[#40467b] rounded-full text-sm font-bold shadow-sm">
                        {verse.verse}
                      </span>
                      <p className="text-gray-800 text-sm leading-relaxed flex-1">
                        {verse.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}

          {/* Výsledok importu */}
          {importResult && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`bg-gradient-to-r px-6 py-4 border-b ${
                importResult.success 
                  ? 'from-green-50 to-emerald-50 border-green-200' 
                  : 'from-red-50 to-rose-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    importResult.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {importResult.success ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={20} className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${
                      importResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {importResult.success ? 'Import Úspešný!' : 'Chyba pri Importe'}
                    </h2>
                    <p className={`text-sm ${
                      importResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {importResult.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`p-6 ${
                importResult.success 
                  ? 'bg-green-50/30' 
                  : 'bg-red-50/30'
              }`}>
                {importResult.success && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle size={16} />
                      <span className="font-medium">Importované verše: {importResult.importedCount}</span>
                    </div>
                    {importResult.skippedCount && importResult.skippedCount > 0 && (
                      <div className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle size={16} />
                        <span className="font-medium">Preskočené (duplikáty): {importResult.skippedCount}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-red-800 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Chyby:
                    </p>
                    <ul className="space-y-1 text-sm text-red-700">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}