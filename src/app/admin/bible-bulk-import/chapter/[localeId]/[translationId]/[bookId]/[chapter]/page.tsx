'use client';

import { ArrowLeft, Book, BookOpen, Check, Edit2, Trash2, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Types
interface BibleVerse {
  id: string;
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

export default function ChapterDetailPage() {
  const router = useRouter();
  const params = useParams();

  const localeId = params.localeId as string;
  const translationId = params.translationId as string;
  const bookId = params.bookId as string;
  const chapter = parseInt(params.chapter as string);

  // State
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [locale, setLocale] = useState<Locale | null>(null);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [book, setBook] = useState<BibleBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadChapterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localeId, translationId, bookId, chapter]);

  const loadChapterData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📖 Loading chapter data...');

      // Call API endpoint with admin permissions
      const response = await fetch(
        `/api/admin/bible-bulk-import/chapter?locale_id=${localeId}&translation_id=${translationId}&book_id=${bookId}&chapter=${chapter}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Chyba pri načítaní kapitoly');
      }

      console.log('✅ Loaded verses:', result.data.verses.length);

      setVerses(result.data.verses || []);
      setLocale(result.data.locale);
      setTranslation(result.data.translation);
      setBook(result.data.book);
    } catch (error) {
      console.error('Error loading chapter data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Neznáma chyba pri načítaní dát';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (verse: BibleVerse) => {
    setEditingId(verse.id);
    setEditText(verse.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (verseId: string) => {
    if (!editText.trim()) {
      alert('Text verša nemôže byť prázdny');
      return;
    }

    setSaving(true);
    try {
      // Call API endpoint with admin permissions
      const response = await fetch('/api/admin/bible-bulk-import/verse', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: verseId,
          text: editText.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || 'Chyba pri ukladaní verša');
        return;
      }

      // Update local state
      setVerses(verses.map(v => 
        v.id === verseId ? { ...v, text: editText.trim() } : v
      ));
      
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating verse:', error);
      alert('Chyba pri ukladaní verša');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (verse: BibleVerse, index: number) => {
    if (!confirm(`Naozaj chcete vymazať verš ${index + 1}?\n\n"${verse.text.substring(0, 100)}..."`)) {
      return;
    }

    try {
      // Call API endpoint with admin permissions
      const response = await fetch(`/api/admin/bible-bulk-import/verse?id=${verse.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || 'Chyba pri mazaní verša');
        return;
      }

      // Update local state
      setVerses(verses.filter(v => v.id !== verse.id));
      
      alert(result.message);
    } catch (error) {
      console.error('Error deleting verse:', error);
      alert('Chyba pri mazaní verša');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#40467b] border-t-transparent mb-6"></div>
            <span className="text-lg font-medium text-gray-700">Načítavam verše...</span>
            <p className="text-sm text-gray-500 mt-2">Prosím čakajte</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/admin/bible-bulk-import')}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  Späť na zoznam
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    loadChapterData();
                  }}
                  className="bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  Skúsiť znova
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Book size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    {book?.name} - Kapitola {chapter}
                  </h1>
                  <p className="text-indigo-100 mt-1">
                    {locale?.name} ({locale?.code}) - {translation?.name} ({translation?.short_name})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{verses.length}</div>
                  <div className="text-sm text-indigo-100 mt-1">Celkom veršov</div>
                </div>
                {verses.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-lg font-bold text-white drop-shadow">
                      {new Date(verses[0].created_at).toLocaleDateString('sk-SK')}
                    </div>
                    <div className="text-sm text-indigo-100 mt-1">Dátum importu</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Verses List */}
        {verses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Žiadne verše</h3>
            <p className="text-gray-600">Pre túto kapitolu neboli nájdené žiadne verše.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={20} className="text-[#40467b]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Verše kapitoly</h2>
                  <p className="text-sm text-gray-600">Čítajte po jednom verši</p>
                </div>
              </div>
            </div>

            {/* Verses */}
            <div className="divide-y divide-gray-200">
              {verses.map((verse, index) => (
                <div
                  key={verse.id}
                  className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex gap-5">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <span className="text-[#40467b] font-bold text-base">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        {editingId === verse.id ? (
                          // Edit mode
                          <div className="space-y-3">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-4 py-3 border-2 border-[#40467b] rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-transparent resize-none text-gray-800 leading-relaxed"
                              rows={4}
                              disabled={saving}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(verse.id)}
                                disabled={saving || !editText.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white rounded-lg hover:shadow-md transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {saving ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span>Ukladám...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check size={16} />
                                    <span>Uložiť</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold disabled:opacity-50"
                              >
                                <X size={16} />
                                <span>Zrušiť</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <p className="text-gray-800 leading-relaxed text-base">
                              {verse.text}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="text-xs text-gray-400 font-mono">
                                {verse.id}
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(verse)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium"
                                  title="Upraviť verš"
                                >
                                  <Edit2 size={14} />
                                  <span>Upraviť</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(verse, index)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all text-sm font-medium"
                                  title="Vymazať verš"
                                >
                                  <Trash2 size={14} />
                                  <span>Vymazať</span>
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Button at Bottom */}
        {verses.length > 10 && (
          <div className="mt-8">
            <button
              onClick={() => router.push('/admin/bible-bulk-import')}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 hover:border-[#40467b] transition-all flex items-center justify-center gap-2 font-semibold shadow-sm hover:shadow"
            >
              <ArrowLeft className="w-5 h-5" />
              Späť na zoznam
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
