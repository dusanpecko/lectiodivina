"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";

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
  currentLocaleId: number | null;
}

export function BibleImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  currentLocaleId 
}: BibleImportModalProps) {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  
  const [selectedTranslation, setSelectedTranslation] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedVerseStart, setSelectedVerseStart] = useState<string>("");
  const [selectedVerseEnd, setSelectedVerseEnd] = useState<string>("");
  const [previewText, setPreviewText] = useState<string>("");

  // Load translations for current locale
  useEffect(() => {
    if (isOpen && currentLocaleId) {
      loadTranslations();
    }
  }, [isOpen, currentLocaleId]);

  useEffect(() => {
    if (selectedTranslation) {
      loadBooks();
    }
  }, [selectedTranslation]);

  useEffect(() => {
    if (selectedBook) {
      loadChapters();
    }
  }, [selectedBook]);

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      loadVerses();
    }
  }, [selectedBook, selectedChapter]);

  useEffect(() => {
    generatePreview();
  }, [verses, selectedVerseStart, selectedVerseEnd]);

  const loadTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('id, code, name, locale_id')
        .eq('locale_id', currentLocaleId)
        .eq('is_active', true);

      if (!error && data) {
        setTranslations(data);
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
        .from('bible_verses')
        .select('chapter')
        .eq('book_id', selectedBook)
        .eq('translation_id', selectedTranslation)
        .eq('is_active', true);

      if (!error && data) {
        const uniqueChapters = [...new Set(data.map(v => v.chapter))].sort((a, b) => a - b);
        setChapters(uniqueChapters);
      }
    } catch (error) {
      console.error('Chyba pri načítaní kapitol:', error);
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
        setVerses(data.map((v: any) => ({
          id: v.id,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
          book: {
            id: v.books.id,
            code: v.books.code,
            name: v.books.name,
            full_name: v.books.full_name,
            order_number: v.books.order_number,
            locale_id: v.books.locale_id
          } as Book,
          translation: {
            id: v.translations.id,
            code: v.translations.code,
            name: v.translations.name,
            locale_id: v.translations.locale_id
          } as Translation
        })));
      }
    } catch (error) {
      console.error('Chyba pri načítaní veršov:', error);
    }
    setLoading(false);
  };

  const generatePreview = () => {
    if (!verses.length || !selectedVerseStart) return;

    const startVerse = parseInt(selectedVerseStart);
    const endVerse = selectedVerseEnd ? parseInt(selectedVerseEnd) : startVerse;
    
    const selectedVerses = verses.filter(v => 
      v.verse >= startVerse && v.verse <= endVerse
    );

    const text = selectedVerses
      .map(v => `${v.verse} ${v.text}`)
      .join(' ');

    setPreviewText(text);
  };

  const handleImport = () => {
    if (!previewText || !selectedBook || !selectedChapter || !selectedVerseStart) {
      return;
    }

    const book = books.find(b => b.id.toString() === selectedBook);
    const translation = translations.find(t => t.id.toString() === selectedTranslation);
    const startVerse = parseInt(selectedVerseStart);
    const endVerse = selectedVerseEnd ? parseInt(selectedVerseEnd) : startVerse;
    
    let reference = `${book?.code} ${selectedChapter}`;
    if (startVerse === endVerse) {
      reference += `,${startVerse}`;
    } else {
      reference += `,${startVerse}-${endVerse}`;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Preklad Biblie
              </label>
              <select
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Vyberte preklad --</option>
                {translations.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </div>

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