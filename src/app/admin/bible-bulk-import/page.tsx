'use client';

import { useSupabase } from "@/app/components/SupabaseProvider";
import { Book, BookOpen, ChevronLeft, ChevronRight, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Types
interface BibleVerse {
  id: string;
  verse_number: number;
  text: string;
  created_at: string;
  locale_id: string;
  translation_id: string;
  book_id: string;
  chapter: number;
}

interface Locale {
  id: string;
  name: string;
  code: string;
}

interface Translation {
  id: string;
  name: string;
  short_name: string;
}

interface BibleBook {
  id: string;
  name: string;
  order_number: number;
}

interface GroupedVerse {
  locale: Locale;
  translation: Translation;
  book: BibleBook;
  chapter: number;
  verses: BibleVerse[];
  verseCount: number;
  created_at: string;
}

interface FilterState {
  localeId: string;
  translationId: string;
  bookId: string;
  chapter: string;
  search: string;
}

const ITEMS_PER_PAGE = 10;

export default function BibleBulkImportPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  
  // State
  const [groupedVerses, setGroupedVerses] = useState<GroupedVerse[]>([]);
  const [allLocales, setAllLocales] = useState<Locale[]>([]); // All locales from DB
  const [allTranslations, setAllTranslations] = useState<Translation[]>([]); // All translations from DB
  const [allBooks, setAllBooks] = useState<BibleBook[]>([]); // All books from DB
  
  // Filtered options based on selected values
  const [filteredTranslations, setFilteredTranslations] = useState<Translation[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BibleBook[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versesLoading, setVersesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    localeId: '',
    translationId: '',
    bookId: '',
    chapter: '',
    search: ''
  });

  // Load data on component mount
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (isMounted) {
        await loadAllData();
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload verses when filters change (but only after reference data is loaded)  
  useEffect(() => {
    let isMounted = true;
    
    if (allLocales.length > 0 && allTranslations.length > 0 && allBooks.length > 0) {
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          loadVerses();
        }
      }, 300); // Debounce to avoid too many requests
      
      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.localeId, filters.translationId, filters.bookId, filters.chapter, filters.search]);

  // Update filtered translations when locale changes
  useEffect(() => {
    let isMounted = true;
    
    const update = async () => {
      if (filters.localeId && allTranslations.length > 0) {
        if (isMounted) {
          await updateFilteredTranslations();
        }
      } else {
        if (isMounted) {
          setFilteredTranslations(allTranslations);
        }
      }
    };
    
    update();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.localeId, allTranslations]);

  // Update filtered books when locale or translation changes
  useEffect(() => {
    let isMounted = true;
    
    const update = async () => {
      if ((filters.localeId || filters.translationId) && allBooks.length > 0) {
        if (isMounted) {
          await updateFilteredBooks();
        }
      } else {
        if (isMounted) {
          setFilteredBooks(allBooks);
        }
      }
    };
    
    update();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.localeId, filters.translationId, allBooks]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First load reference data
      const [localesRes, translationsRes, booksRes] = await Promise.all([
        supabase.from('locales').select('*').order('name'),
        supabase.from('translations').select('*').order('name'),
        supabase.from('books').select('*').order('order_number')
      ]);

      // Check for errors
      if (localesRes.error) {
        throw new Error(`Chyba pri načítaní jazykov: ${localesRes.error.message}`);
      }
      if (translationsRes.error) {
        throw new Error(`Chyba pri načítaní prekladov: ${translationsRes.error.message}`);
      }
      if (booksRes.error) {
        throw new Error(`Chyba pri načítaní kníh: ${booksRes.error.message}`);
      }

      console.log('📊 Reference data loaded:', {
        locales: localesRes.data?.length,
        translations: translationsRes.data?.length,
        books: booksRes.data?.length
      });

      if (localesRes.data) {
        setAllLocales(localesRes.data);
      }
      if (translationsRes.data) {
        setAllTranslations(translationsRes.data);
        setFilteredTranslations(translationsRes.data);
      }
      if (booksRes.data) {
        setAllBooks(booksRes.data);
        setFilteredBooks(booksRes.data);
      }

      // Then load verses
      await loadVerses();
    } catch (error) {
      console.error('Error loading all data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Neznáma chyba pri načítaní dát';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update filtered translations based on selected locale
  const updateFilteredTranslations = async () => {
    if (!filters.localeId) {
      setFilteredTranslations(allTranslations);
      return;
    }

    try {
      // Get all translations for the selected locale
      // Check if translations table has locale_id column
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('locale_id', filters.localeId);

      if (error) {
        console.error('Error getting translations:', error);
        // If there's no locale_id column, show all translations
        setFilteredTranslations(allTranslations);
        return;
      }

      if (data && data.length > 0) {
        setFilteredTranslations(data);
      } else {
        // If no results with locale filter, show all translations
        console.log('⚠️ No translations found for locale, showing all');
        setFilteredTranslations(allTranslations);
      }
    } catch (error) {
      console.error('Error in updateFilteredTranslations:', error);
      setFilteredTranslations(allTranslations);
    }
  };

  // Update filtered books based on selected locale and translation
  const updateFilteredBooks = async () => {
    if (!filters.localeId && !filters.translationId) {
      setFilteredBooks(allBooks);
      return;
    }

    try {
      // Get all books for the selected locale/translation from books table
      let query = supabase
        .from('books')
        .select('*')
        .order('order_number');

      // Try filtering by locale_id if it exists in books table
      if (filters.localeId) {
        query = query.eq('locale_id', filters.localeId);
      }

      const { data, error } = await query;
        
      if (error) {
        console.log('⚠️ Error filtering books, showing all books:', error.message);
        setFilteredBooks(allBooks);
        return;
      }

      if (data && data.length > 0) {
        setFilteredBooks(data);
      } else {
        // If no locale-specific books found, show all books
        setFilteredBooks(allBooks);
      }
    } catch (error) {
      console.error('Error in updateFilteredBooks:', error);
      setFilteredBooks(allBooks);
    }
  };

  const loadVerses = useCallback(async () => {
    try {
      if (allLocales.length === 0 || allTranslations.length === 0 || allBooks.length === 0) {
        console.log('⏳ Reference data not loaded yet, skipping verses load');
        return;
      }

      setVersesLoading(true);
      setError(null);
      console.log('🔍 Loading bible verses...');

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.localeId) params.append('locale_id', filters.localeId);
      if (filters.translationId) params.append('translation_id', filters.translationId);
      if (filters.bookId) params.append('book_id', filters.bookId);
      if (filters.chapter) params.append('chapter', filters.chapter);
      if (filters.search) params.append('search', filters.search);

      // Load data in batches to overcome 1000 record limit
      const BATCH_SIZE = 1000;
      let allVerses: BibleVerse[] = [];
      let hasMore = true;
      let offset = 0;

      while (hasMore) {
        params.set('offset', offset.toString());
        params.set('limit', BATCH_SIZE.toString());

        const response = await fetch(`/api/admin/bible-bulk-import/list?${params.toString()}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Chyba pri načítaní dát');
        }

        if (result.data && result.data.length > 0) {
          allVerses = [...allVerses, ...result.data];
          console.log(`📦 Loaded batch: ${result.data.length} verses (total: ${allVerses.length})`);
          
          // If we got less than batch size or hasMore is false, we're done
          if (!result.hasMore || result.data.length < BATCH_SIZE) {
            hasMore = false;
          } else {
            offset += BATCH_SIZE;
          }
        } else {
          hasMore = false;
        }
      }

      console.log('✅ Total verses loaded:', allVerses.length);

      if (allVerses.length > 0) {
        // Group verses by locale, translation, book, and chapter
        const groupedMap = new Map<string, {
          locale_id: string;
          translation_id: string;
          book_id: string;
          chapter: number;
          verses: BibleVerse[];
          created_at: string;
        }>();

        allVerses.forEach((verse) => {
          const key = `${verse.locale_id}-${verse.translation_id}-${verse.book_id}-${verse.chapter}`;
          
          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              locale_id: verse.locale_id,
              translation_id: verse.translation_id,
              book_id: verse.book_id,
              chapter: verse.chapter,
              verses: [],
              created_at: verse.created_at
            });
          }
          
          groupedMap.get(key)!.verses.push(verse);
        });

        console.log('📚 Found unique chapters:', groupedMap.size);

        // Convert map to array and map to GroupedVerse format
        const grouped = Array.from(groupedMap.values()).map((group) => {
          const locale = allLocales.find((l: Locale) => l.id === group.locale_id);
          const translation = allTranslations.find((t: Translation) => t.id === group.translation_id);
          const book = allBooks.find((b: BibleBook) => b.id === group.book_id);

          return {
            locale: locale || { id: group.locale_id, name: 'Unknown', code: '??' },
            translation: translation || { id: group.translation_id, name: 'Unknown', short_name: '??' },
            book: book || { id: group.book_id, name: 'Unknown', order_number: 0 },
            chapter: group.chapter,
            verses: group.verses,
            verseCount: group.verses.length,
            created_at: group.created_at
          };
        });

        setGroupedVerses(grouped as GroupedVerse[]);
        setTotalPages(Math.ceil(grouped.length / ITEMS_PER_PAGE));
      } else {
        setGroupedVerses([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error in loadVerses:', error);
      const errorMessage = error instanceof Error ? error.message : 'Neznáma chyba pri načítaní veršov';
      setError(errorMessage);
      setGroupedVerses([]);
      setTotalPages(1);
    } finally {
      setVersesLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, filters]);

  // Delete chapter function
  const deleteChapter = async (locale_id: string, translation_id: string, book_id: string, chapter: number) => {
    if (!confirm('Naozaj chcete vymazať túto kapitolu? Táto akcia sa nedá vrátiť späť.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting chapter with params:', { locale_id, translation_id, book_id, chapter });
      
      // Call API endpoint with admin permissions
      const response = await fetch(
        `/api/admin/bible-bulk-import/chapter?locale_id=${locale_id}&translation_id=${translation_id}&book_id=${book_id}&chapter=${chapter}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();
      console.log('📋 Delete result:', result);

      if (!response.ok || !result.success) {
        alert(result.message || 'Chyba pri mazaní kapitoly');
      } else {
        alert(result.message);
        loadVerses(); // Reload data
      }
    } catch (error) {
      console.error('💥 Exception in deleteChapter:', error);
      alert(`Chyba pri mazaní kapitoly: ${error instanceof Error ? error.message : 'Neznáma chyba'}`);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setCurrentPage(1); // Reset to first page when filtering
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Get paginated data
  const getPaginatedData = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return groupedVerses.slice(start, end);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#40467b] border-t-transparent mb-6"></div>
            <span className="text-lg font-medium text-gray-700">Načítavam dáta...</span>
            <p className="text-sm text-gray-500 mt-2">Prosím čakajte</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !loading && groupedVerses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chyba pri načítaní dát</h2>
              <p className="text-gray-600 mb-6 max-w-md">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadAllData();
                }}
                className="bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Skúsiť znova
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <Book size={28} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                      Bible Bulk Import
                    </h1>
                    <p className="text-indigo-100 mt-1">Spravujte importované biblické verše</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/admin/bible-bulk-import/new')}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Nový import
                </button>
              </div>
              
              {/* Štatistiky */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{groupedVerses.length}</div>
                  <div className="text-sm text-indigo-100 mt-1">Celkom kapitol</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{allLocales.length}</div>
                  <div className="text-sm text-indigo-100 mt-1">Jazykov</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{allTranslations.length}</div>
                  <div className="text-sm text-indigo-100 mt-1">Prekladov</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{allBooks.length}</div>
                  <div className="text-sm text-indigo-100 mt-1">Kníh</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Filter size={20} className="text-[#40467b]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Filtre</h2>
              <p className="text-sm text-gray-500">Nájdite kapitoly podľa kritérií</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-1" />
                Hľadať v texte
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
                  placeholder="Hľadať..."
                />
              </div>
            </div>

            {/* Locale Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen size={16} className="inline mr-1" />
                Jazyk
              </label>
              <select
                value={filters.localeId}
                onChange={(e) => handleFilterChange('localeId', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
              >
                <option value="">Všetky jazyky</option>
                {allLocales.map((locale: Locale) => (
                  <option key={locale.id} value={locale.id}>
                    {locale.name} ({locale.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Translation Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Book size={16} className="inline mr-1" />
                Preklad
              </label>
              <select
                value={filters.translationId}
                onChange={(e) => handleFilterChange('translationId', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
              >
                <option value="">Všetky preklady</option>
                {filteredTranslations.map((translation: Translation) => (
                  <option key={translation.id} value={translation.id}>
                    {translation.name} ({translation.short_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Book Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen size={16} className="inline mr-1" />
                Kniha
              </label>
              <select
                value={filters.bookId}
                onChange={(e) => handleFilterChange('bookId', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
              >
                <option value="">Všetky knihy</option>
                {filteredBooks.map((book: BibleBook) => (
                  <option key={book.id} value={book.id}>
                    {book.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Kapitola
              </label>
              <input
                type="number"
                value={filters.chapter}
                onChange={(e) => handleFilterChange('chapter', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
                placeholder="Číslo kapitoly"
                min="1"
              />
            </div>
          </div>

          {/* Clear filters button */}
          {(filters.localeId || filters.translationId || filters.bookId || filters.chapter || filters.search) && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setFilters({
                    localeId: '',
                    translationId: '',
                    bookId: '',
                    chapter: '',
                    search: ''
                  });
                  setCurrentPage(1);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                <X className="w-4 h-4" />
                Vyčistiť filtre
              </button>
            </div>
          )}
        </div>

        {/* Error Alert (non-blocking) */}
        {error && groupedVerses.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-3 text-red-800">
              <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium flex-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={20} className="text-[#40467b]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Importované kapitoly
                    {versesLoading && (
                      <span className="ml-2 inline-flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#40467b]"></div>
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-600">Celkom: {groupedVerses.length} kapitol</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
                Strana {currentPage} z {totalPages}
              </div>
            </div>
          </div>

          {versesLoading && groupedVerses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#40467b] border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Načítavam kapitoly...</p>
            </div>
          ) : groupedVerses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Žiadne dáta</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {Object.values(filters).some(f => f) 
                  ? 'Žiadne kapitoly nevyhovujú zadaným filtrom. Skúste zmeniť kritériá vyhľadávania.'
                  : 'Zatiaľ nie sú importované žiadne biblické verše. Kliknite na "Nový import" pre pridanie kapitol.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Chapter List */}
              <div className="divide-y divide-gray-200">
                {getPaginatedData().map((group) => (
                  <div key={`${group.locale.id}-${group.translation.id}-${group.book.id}-${group.chapter}`} className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-200">
                    <div className="p-6 flex items-center justify-between">
                      <button
                        onClick={() => router.push(`/admin/bible-bulk-import/chapter/${group.locale.id}/${group.translation.id}/${group.book.id}/${group.chapter}`)}
                        className="flex items-center gap-4 flex-1 text-left"
                      >
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                            <BookOpen className="w-7 h-7 text-[#40467b]" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-indigo-100 flex items-center justify-center text-xs font-bold text-[#40467b]">
                            {group.chapter}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#40467b] transition-colors mb-2">
                            {group.book.name} - Kapitola {group.chapter}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
                              <Book className="w-3.5 h-3.5" />
                              {group.locale.name} ({group.locale.code})
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium">
                              <BookOpen className="w-3.5 h-3.5" />
                              {group.translation.name} ({group.translation.short_name})
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg font-medium">
                              <Filter className="w-3.5 h-3.5" />
                              {group.verseCount} veršov
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-lg">
                              {new Date(group.created_at).toLocaleDateString('sk-SK')}
                            </span>
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChapter(
                              group.locale.id,
                              group.translation.id,
                              group.book.id,
                              group.chapter
                            );
                          }}
                          className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow"
                          title="Vymazať kapitolu"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Predchádzajúca
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`min-w-[40px] px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white shadow-md'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Ďalšia
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}