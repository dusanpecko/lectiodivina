"use client";

import { useSupabase } from "@/app/components/SupabaseProvider";
import { useEffect, useState } from "react";

// Interfaces
// interface Locale {
//   id: number;
//   code: string;
//   name: string;
//   native_name: string;
//   is_active: boolean;
// }

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

interface BibleVerse {
  id: number;
  chapter: number;
  verse: number;
  text: string;
  book: Book;
  translation: Translation;
}

interface BibleImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (verses: string, reference: string, translationName: string) => void;
  currentLocaleId: number;
}

interface VerseWithRelations {
  id: number;
  chapter: number;
  verse: number;
  text: string;
  books: {
    id: number;
    code: string;
    name: string;
    full_name: string;
    order_number: number;
    locale_id: number;
  }[];
  translations: {
    id: number;
    code: string;
    name: string;
    locale_id: number;
  }[];
}

export default function BibleImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  currentLocaleId 
}: BibleImportModalProps) {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [translationsList, setTranslationsList] = useState<Translation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  
  const [selectedTranslation, setSelectedTranslation] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedVerseStart, setSelectedVerseStart] = useState<string>("");
  const [selectedVerseEnd, setSelectedVerseEnd] = useState<string>("");
  const [multiVerseSpec, setMultiVerseSpec] = useState<string>("");
  const [previewText, setPreviewText] = useState<string>("");
  const [quickReference, setQuickReference] = useState<string>("");
  const [useQuickMode, setUseQuickMode] = useState<boolean>(true);

  // RESET STATE ON OPEN
  useEffect(() => {
    if (isOpen) {
      setSelectedTranslation("");
      setSelectedBook("");
      setSelectedChapter("");
      setSelectedVerseStart("");
      setSelectedVerseEnd("");
      setMultiVerseSpec("");
      setPreviewText("");
      setQuickReference("");
      setUseQuickMode(true);
      setBooks([]);
      setChapters([]);
      setVerses([]);
    }
  }, [isOpen]);

  // RESET CASCADE ON TRANSLATION CHANGE
  useEffect(() => {
    if (!isOpen) return;
    setSelectedBook("");
    setSelectedChapter("");
    setSelectedVerseStart("");
    setSelectedVerseEnd("");
    setMultiVerseSpec("");
    setChapters([]);
    setVerses([]);
    setPreviewText("");
  }, [selectedTranslation, isOpen]);

  // RESET CASCADE ON BOOK CHANGE
  useEffect(() => {
    if (!isOpen) return;
    setSelectedChapter("");
    setSelectedVerseStart("");
    setSelectedVerseEnd("");
    setMultiVerseSpec("");
    setVerses([]);
    setPreviewText("");
  }, [selectedBook, isOpen]);

  // RESET CASCADE ON CHAPTER CHANGE
  useEffect(() => {
    if (!isOpen) return;
    setSelectedVerseStart("");
    setSelectedVerseEnd("");
    setMultiVerseSpec("");
    setVerses([]);
    setPreviewText("");
  }, [selectedChapter, isOpen]);

  // Load translations for current locale
  useEffect(() => {
    if (isOpen && currentLocaleId) {
      loadTranslations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentLocaleId]);

  useEffect(() => {
    if (selectedTranslation) {
      loadBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTranslation]);

  useEffect(() => {
    if (selectedBook) {
      loadChapters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook]);

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      loadVerses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook, selectedChapter]);

  useEffect(() => {
    generatePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses, selectedVerseStart, selectedVerseEnd, multiVerseSpec]);

  const loadTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('id, code, name, locale_id')
        .eq('locale_id', currentLocaleId)
        .eq('is_active', true);

      if (!error && data) {
        setTranslationsList(data);
      }
    } catch (error) {
      console.error('Chyba pri načítaní prekladov:', error);
    }
  };

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, code, name, full_name, order_number, locale_id')
        .eq('locale_id', currentLocaleId)
        .eq('is_active', true)
        .order('order_number');

      if (!error && data) {
        setBooks(data);
      }
    } catch (error) {
      console.error('Chyba pri načítaní kníh:', error);
    }
  };

  const loadChapters = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_distinct_chapters', {
          p_book_id: parseInt(selectedBook),
          p_translation_id: parseInt(selectedTranslation),
          p_is_active: true
        });

      if (error) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('bible_verses')
          .select('chapter')
          .eq('book_id', selectedBook)
          .eq('translation_id', selectedTranslation)
          .eq('is_active', true)
          .order('chapter');

        if (fallbackError) {
          console.error('Chyba pri načítaní kapitol:', fallbackError);
          return;
        }

        if (fallbackData && fallbackData.length > 0) {
          const uniqueChapters = [...new Set(fallbackData.map(v => v.chapter))].sort((a, b) => a - b);
          setChapters(uniqueChapters);
        } else {
          setChapters([]);
        }
      } else if (data) {
        const chapters = data.map((item: { chapter: number }) => item.chapter).sort((a: number, b: number) => a - b);
        setChapters(chapters);
      }
    } catch (error) {
      console.error('Chyba pri načítaní kapitol:', error);
      setChapters([]);
    }
  };

  const loadVerses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bible_verses')
        .select(`
          id,
          chapter,
          verse,
          text,
          books!inner(id, code, name, full_name, order_number, locale_id),
          translations!inner(id, code, name, locale_id)
        `)
        .eq('book_id', selectedBook)
        .eq('translation_id', selectedTranslation)
        .eq('chapter', selectedChapter)
        .eq('is_active', true)
        .order('verse');

      if (!error && data) {
        setVerses(data.map((v: VerseWithRelations) => ({
          id: v.id,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
          book: {
            id: v.books[0]?.id || 0,
            code: v.books[0]?.code || '',
            name: v.books[0]?.name || '',
            full_name: v.books[0]?.full_name || '',
            order_number: v.books[0]?.order_number || 0,
            locale_id: v.books[0]?.locale_id || 0
          } as Book,
          translation: {
            id: v.translations[0]?.id || 0,
            code: v.translations[0]?.code || '',
            name: v.translations[0]?.name || '',
            locale_id: v.translations[0]?.locale_id || 0
          } as Translation
        })));
      }
    } catch (error) {
      console.error('Chyba pri načítaní veršov:', error);
    }
    setLoading(false);
  };

  // ---- Helpers for multi-range parsing ----
  type Range = [number, number];

  const cleanSpec = (specRaw: string) => {
    let spec = specRaw.trim();
    const commaIdx = spec.indexOf(",");
    if (commaIdx !== -1) {
      const before = spec.slice(0, commaIdx);
      if (/\d/.test(before)) {
        spec = spec.slice(commaIdx + 1);
      }
    }
    return spec;
  };

  const parseQuickReference = (ref: string): { 
    bookCode: string; 
    chapter: number; 
    verseSpec: string;
  } | null => {
    const trimmed = ref.trim();
    const match = trimmed.match(/^(\d?\s*[A-Za-zÁ-ž]+\.?)\s*(\d+)\s*,\s*(.+)$/);
    
    if (!match) return null;
    
    const bookCode = match[1].trim().replace(/\s+/g, '');
    const chapter = parseInt(match[2]);
    const verseSpec = match[3].trim();
    
    return { bookCode, chapter, verseSpec };
  };

  const parseVerseSpec = (specRaw: string): Range[] => {
    const spec = cleanSpec(specRaw)
      .replace(/\s+/g, " ")
      .replace(/\s*;\s*/g, ".")
      .trim();

    if (!spec) return [];

    const parts = spec.split(".").map((p) => p.trim()).filter(Boolean);
    const ranges: Range[] = [];

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

  // const normalizeSpec = (ranges: Range[]) => {
  //   return ranges
  //     .map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`))
  //     .join(". ");
  // };

  const handleQuickReference = async () => {
    if (!quickReference.trim() || !selectedTranslation) return;

    setLoading(true);
    const parsed = parseQuickReference(quickReference);
    
    if (!parsed) {
      alert('Nesprávny formát odkazu. Použite formát ako "Lk 23, 35-43" alebo "Mt 4, 12-17. 23-25"');
      setLoading(false);
      return;
    }

    try {
      const book = books.find(b => 
        b.code.toLowerCase() === parsed.bookCode.toLowerCase()
      );

      if (!book) {
        alert(`Kniha "${parsed.bookCode}" nebola nájdená. Skontrolujte, či ste použili správny kód knihy.`);
        setLoading(false);
        return;
      }

      setSelectedBook(book.id.toString());
      setSelectedChapter(parsed.chapter.toString());
      
      const { data, error } = await supabase
        .from('bible_verses')
        .select(`
          id,
          chapter,
          verse,
          text,
          books!inner(id, code, name, full_name, order_number, locale_id),
          translations!inner(id, code, name, locale_id)
        `)
        .eq('book_id', book.id)
        .eq('translation_id', selectedTranslation)
        .eq('chapter', parsed.chapter)
        .eq('is_active', true)
        .order('verse');

      if (!error && data) {
        const loadedVerses = data.map((v: VerseWithRelations) => ({
          id: v.id,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
          book: {
            id: v.books[0]?.id || 0,
            code: v.books[0]?.code || '',
            name: v.books[0]?.name || '',
            full_name: v.books[0]?.full_name || '',
            order_number: v.books[0]?.order_number || 0,
            locale_id: v.books[0]?.locale_id || 0
          } as Book,
          translation: {
            id: v.translations[0]?.id || 0,
            code: v.translations[0]?.code || '',
            name: v.translations[0]?.name || '',
            locale_id: v.translations[0]?.locale_id || 0
          } as Translation
        }));
        
        setVerses(loadedVerses);
        setMultiVerseSpec(parsed.verseSpec);
      } else {
        alert('Verše pre zadaný odkaz neboli nájdené.');
      }
    } catch (error) {
      console.error('Chyba pri spracovaní rýchleho odkazu:', error);
      alert('Nastala chyba pri spracovaní odkazu.');
    }
    setLoading(false);
  };

  const generatePreview = () => {
    if (!verses.length) {
      setPreviewText("");
      return;
    }

    const specRanges = multiVerseSpec.trim() ? parseVerseSpec(multiVerseSpec) : [];
    if (specRanges.length) {
      const seen = new Set<number>();
      const bucket: BibleVerse[] = [];
      for (const [a, b] of specRanges) {
        for (const v of verses) {
          if (v.verse >= a && v.verse <= b && !seen.has(v.verse)) {
            seen.add(v.verse);
            bucket.push(v);
          }
        }
      }
      const text = bucket.map((v) => `${v.verse} ${v.text}`).join(" ");
      setPreviewText(text);
      return;
    }

    if (!selectedVerseStart) {
      setPreviewText("");
      return;
    }

    const startVerse = parseInt(selectedVerseStart);
    const endVerse = selectedVerseEnd ? parseInt(selectedVerseEnd) : startVerse;
    const selectedVerses = verses.filter(v => v.verse >= startVerse && v.verse <= endVerse);
    const text = selectedVerses.map(v => `${v.verse} ${v.text}`).join(' ');
    setPreviewText(text);
  };

  const handleImport = () => {
    if (!previewText.trim()) {
      console.log('Import failed: no preview text');
      return;
    }

    let book, chapter;
    
    if (selectedBook && selectedChapter) {
      book = books.find(b => b.id.toString() === selectedBook);
      chapter = selectedChapter;
    } else if (verses.length > 0) {
      book = verses[0].book;
      chapter = verses[0].chapter.toString();
    } else {
      console.log('Import failed: no book/chapter info');
      return;
    }

    const translation = translationsList.find(t => t.id.toString() === selectedTranslation);

    let reference = `${book?.code || book?.name} ${chapter}`;
    const specRanges = multiVerseSpec.trim() ? parseVerseSpec(multiVerseSpec) : [];
    if (specRanges.length) {
      reference += `, ${specRanges.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(". ")}`;
    } else if (selectedVerseStart) {
      const startVerse = parseInt(selectedVerseStart);
      const endVerse = selectedVerseEnd ? parseInt(selectedVerseEnd) : startVerse;
      if (startVerse === endVerse) {
        reference += `,${startVerse}`;
      } else {
        reference += `,${startVerse}-${endVerse}`;
      }
    }

    onImport(previewText, reference, translation?.name || "");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📖</span>
              <h2 className="text-xl font-semibold">Import z Biblie</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Výber prekladu */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preklad Biblie
            </label>
            <select
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!currentLocaleId}
            >
              <option value="">-- Vyberte preklad --</option>
              {translationsList.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>

          {/* Prepínač režimov */}
          {selectedTranslation && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setUseQuickMode(true);
                    setSelectedBook("");
                    setSelectedChapter("");
                    setSelectedVerseStart("");
                    setSelectedVerseEnd("");
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    useQuickMode 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ⚡ Rýchle zadanie
                </button>
                <button
                  onClick={() => {
                    setUseQuickMode(false);
                    setQuickReference("");
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    !useQuickMode 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  📋 Ručný výber
                </button>
              </div>
            </div>
          )}

          {/* Rýchly režim */}
          {useQuickMode && selectedTranslation && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Biblický odkaz
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={quickReference}
                  onChange={(e) => setQuickReference(e.target.value)}
                  placeholder="napr. Lk 23, 35-43 alebo Mt 4, 12-17. 23-25"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleQuickReference();
                    }
                  }}
                />
                <button
                  onClick={handleQuickReference}
                  disabled={!quickReference.trim() || loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? '⏳' : '🔍'} Načítať
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <strong>Formát:</strong> KódKnihy Kapitola, Verše (napr. <em>Lk 23, 35-43</em> alebo <em>Mt 4, 12-17. 23-25</em>)
              </p>
            </div>
          )}

          {/* Ručný výber */}
          {!useQuickMode && selectedTranslation && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Kniha Biblie
                  </label>
                  <select
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    disabled={!selectedTranslation}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">-- Vyberte knihu --</option>
                    {books.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Kapitola
                  </label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    disabled={!selectedBook}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">-- Kapitola --</option>
                    {chapters.map(ch => (
                      <option key={ch} value={ch}>
                        Kapitola {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Od verša
                  </label>
                  <select
                    value={selectedVerseStart}
                    onChange={(e) => setSelectedVerseStart(e.target.value)}
                    disabled={!verses.length}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">-- Od --</option>
                    {verses.map(v => (
                      <option key={v.id} value={v.verse}>
                        Verš {v.verse}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Po verš (voliteľné)
                  </label>
                  <select
                    value={selectedVerseEnd}
                    onChange={(e) => setSelectedVerseEnd(e.target.value)}
                    disabled={!selectedVerseStart}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">-- Po (jeden verš) --</option>
                    {verses
                      .filter(v => v.verse >= parseInt(selectedVerseStart || "0"))
                      .map(v => (
                        <option key={v.id} value={v.verse}>
                          Verš {v.verse}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Viac úsekov v kapitole (voliteľné)
                </label>
                <input
                  type="text"
                  value={multiVerseSpec}
                  onChange={(e) => setMultiVerseSpec(e.target.value)}
                  placeholder='napr. 12-17. 23-25 alebo 57-66. 80'
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Oddelujte úseky <strong>bodkou</strong> alebo <strong>bodkočiarkou</strong>. Rozsah píšte pomocou <strong>pomlčky</strong>. Ak vyplníte toto pole, nastavenie &ldquo;Od/Po verš&rdquo; sa ignoruje.
                </p>
              </div>
            </>
          )}

          {/* Náhľad */}
          {previewText && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Náhľad textu
              </label>
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="text-gray-800 leading-relaxed">{previewText}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Zrušiť
            </button>
            <button
              onClick={handleImport}
              disabled={!previewText}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Importovať
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
