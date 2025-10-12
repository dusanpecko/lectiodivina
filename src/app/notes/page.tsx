// src/app/notes/page.tsx
'use client';

import {
  BookOpen,
  Calendar,
  FileText,
  Plus,
  Quote,
  Save,
  Search,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import { useSupabase } from '../components/SupabaseProvider';
import { translations } from '../i18n';
import { formatDate } from '../utils/dateUtils';

interface Note {
  id: string;
  title: string;
  content: string;
  bible_reference?: string;
  bible_quote?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

type EditorMode = 'empty' | 'new' | 'edit';

export default function NotesPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('empty');
  const [isSaving, setIsSaving] = useState(false);
  
  // Editor state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editBibleRef, setEditBibleRef] = useState('');
  const [editBibleQuote, setEditBibleQuote] = useState('');
  
  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<'list' | 'editor'>('list');
  
  const { supabase, session, isLoading: authLoading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [session, authLoading, router]);

  const fetchNotes = async () => {
    if (!session || !supabase) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setNotes(data || []);
      setFilteredNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session && supabase) {
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, supabase]);

  const filterNotes = (query: string) => {
    if (!query.trim()) {
      setFilteredNotes(notes);
      setSearchQuery('');
      return;
    }

    const q = query.toLowerCase();
    setSearchQuery(query);
    
    const filtered = notes.filter(note => {
      const title = note.title.toLowerCase();
      const content = note.content.toLowerCase();
      const bibleReference = (note.bible_reference || '').toLowerCase();
      const bibleQuote = (note.bible_quote || '').toLowerCase();
      
      return title.includes(q) || 
             content.includes(q) || 
             bibleReference.includes(q) || 
             bibleQuote.includes(q);
    });
    
    setFilteredNotes(filtered);
  };

  const handleNewNote = () => {
    setEditorMode('new');
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
    setEditBibleRef('');
    setEditBibleQuote('');
    // Switch to editor tab on mobile
    setMobileTab('editor');
  };

  const handleSelectNote = (note: Note) => {
    setEditorMode('edit');
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditBibleRef(note.bible_reference || '');
    setEditBibleQuote(note.bible_quote || '');
    // Switch to editor tab on mobile
    setMobileTab('editor');
  };

  const handleSaveNote = async () => {
    if (!supabase || !session) return;
    if (!editTitle.trim() || !editContent.trim()) {
      alert(t.notesPage.editor.validation.required_fields);
      return;
    }

    setIsSaving(true);
    try {
      if (editorMode === 'new') {
        const { data, error } = await supabase
          .from('notes')
          .insert([{
            user_id: session.user.id,
            title: editTitle.trim(),
            content: editContent.trim(),
            bible_reference: editBibleRef.trim() || null,
            bible_quote: editBibleQuote.trim() || null
          }])
          .select()
          .single();

        if (error) throw error;
        
        await fetchNotes();
        setSelectedNote(data);
        setEditorMode('edit');
      } else if (editorMode === 'edit' && selectedNote) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: editTitle.trim(),
            content: editContent.trim(),
            bible_reference: editBibleRef.trim() || null,
            bible_quote: editBibleQuote.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedNote.id);

        if (error) throw error;
        
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!supabase) return;
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      
      if (selectedNote?.id === noteId) {
        setEditorMode('empty');
        setSelectedNote(null);
      }
      
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note');
    }
  };

  const handleCloseEditor = () => {
    if (editorMode === 'new' && (editTitle || editContent)) {
      if (!confirm(t.notesPage.editor.confirm.close_unsaved)) {
        return;
      }
    }
    setEditorMode('empty');
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
    setEditBibleRef('');
    setEditBibleQuote('');
  };

  if (authLoading || !session) {
    return (
      <div className="h-screen flex items-center justify-center pt-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#40467b' }}>
            {authLoading ? t.notesPage.loading_auth : t.notesPage.redirecting_login}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-8 px-4">
      <div className="max-w-[1800px] mx-auto">
        
        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-4">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-1 flex">
            <button
              onClick={() => setMobileTab('list')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                mobileTab === 'list'
                  ? 'text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{ backgroundColor: mobileTab === 'list' ? '#40467b' : 'transparent' }}
            >
              <BookOpen size={16} />
              {t.notesPage.editor.tabs.list}
            </button>
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                mobileTab === 'editor'
                  ? 'text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{ backgroundColor: mobileTab === 'editor' ? '#40467b' : 'transparent' }}
            >
              <FileText size={16} />
              {t.notesPage.editor.tabs.editor}
            </button>
          </div>
        </div>
        
        {/* Two-column layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 min-h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)]">
            
            {/* LEFT COLUMN - Notes List */}
            <div className={`flex-1 lg:col-span-4 xl:col-span-3 ${mobileTab === 'list' ? 'block' : 'hidden'} lg:block`}>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl flex flex-col overflow-hidden h-[calc(100vh-160px)] lg:h-[calc(100vh-120px)]">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: '#40467b' }}
                    >
                      <BookOpen size={20} />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-xl font-bold" style={{ color: '#40467b' }}>
                        {t.notesPage.title}
                      </h1>
                      <p className="text-xs text-gray-600">
                        {filteredNotes.length} {filteredNotes.length === 1 ? t.notesPage.notes_count : t.notesPage.notes_count_plural}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNewNote}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 shadow-md"
                    style={{ backgroundColor: '#40467b' }}
                  >
                    <Plus size={18} />
                    <span className="font-medium">{t.notesPage.new_note}</span>
                  </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                                            placeholder={t.notesPage.search_placeholder}
                      value={searchQuery}
                      onChange={(e) => filterNotes(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => filterNotes('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes List - scrollable */}
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
                      </div>
                      <p className="text-sm text-gray-600">{t.notesPage.loading}</p>
                    </div>
                  ) : filteredNotes.length === 0 ? (
                    <div className="p-8 text-center">
                      <FileText size={32} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        {searchQuery ? 'No results' : t.notesPage.empty_state.title}
                      </p>
                      {!searchQuery && (
                        <p className="text-xs text-gray-500">
                          {t.notesPage.empty_state.subtitle}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredNotes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => handleSelectNote(note)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedNote?.id === note.id
                              ? 'bg-purple-50 border-l-4 shadow-sm'
                              : 'hover:bg-gray-50 border-l-4 border-transparent'
                          }`}
                          style={{
                            borderLeftColor: selectedNote?.id === note.id ? '#40467b' : 'transparent'
                          }}
                        >
                          <h3 
                            className="font-semibold text-sm mb-1 truncate"
                            style={{ color: selectedNote?.id === note.id ? '#40467b' : '#1f2937' }}
                          >
                            {note.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {note.content}
                          </p>
                          {note.bible_reference && (
                            <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
                              <Quote size={12} />
                              <span>{note.bible_reference}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={10} />
                            <span>
                              {note.updated_at ? formatDate(note.updated_at) : formatDate(note.created_at)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Editor */}
            <div className={`flex-1 lg:col-span-8 xl:col-span-9 ${mobileTab === 'editor' ? 'block' : 'hidden'} lg:block`}>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl flex flex-col overflow-hidden h-[calc(100vh-160px)] lg:h-[calc(100vh-120px)]">
                
                {editorMode === 'empty' ? (
                  <div className="flex-1 flex items-center justify-center p-12">
                    <div className="text-center max-w-md">
                      <div 
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}
                      >
                        <Sparkles size={40} style={{ color: '#40467b' }} />
                      </div>
                      <h2 className="text-2xl font-bold mb-3" style={{ color: '#40467b' }}>
                        {t.notesPage.empty_editor.title}
                      </h2>
                      <p className="text-gray-600 mb-6">
                        {t.notesPage.empty_editor.subtitle}
                      </p>
                      <button
                        onClick={handleNewNote}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:opacity-90 shadow-lg"
                        style={{ backgroundColor: '#40467b' }}
                      >
                        <Plus size={20} />
                        <span className="font-medium">{t.notesPage.empty_editor.button}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Editor Header */}
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: '#40467b' }}
                        >
                          {editorMode === 'new' ? <Plus size={16} /> : <FileText size={16} />}
                        </div>
                        <h2 className="font-semibold" style={{ color: '#40467b' }}>
                          {editorMode === 'new' ? t.notesPage.editor.modes.new_title : t.notesPage.editor.modes.edit_title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        {editorMode === 'edit' && selectedNote && (
                          <button
                            onClick={() => handleDeleteNote(selectedNote.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
                          >
                            <Trash2 size={16} />
                            {t.notesPage.editor.actions.delete}
                          </button>
                        )}
                        <button
                          onClick={handleSaveNote}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 shadow-md text-sm font-medium disabled:opacity-50"
                          style={{ backgroundColor: '#40467b' }}
                        >
                          <Save size={16} />
                          {isSaving ? t.notesPage.editor.actions.saving : t.notesPage.editor.actions.save}
                        </button>
                        <button
                          onClick={handleCloseEditor}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                          style={{ color: '#40467b' }}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Editor Content - scrollable */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="max-w-4xl mx-auto space-y-6">
                        {/* Title */}
                        <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.notesPage.editor.form.title_label}
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder={t.notesPage.editor.form.title_placeholder}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg font-semibold"
                          />
                        </div>

                        {/* Content */}
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#40467b' }}>
                            {t.notesPage.editor.form.content_label}
                          </label>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder={t.notesPage.editor.form.content_placeholder}
                            rows={12}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                          />
                        </div>

                        {/* Bible Reference Section */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-r-lg p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Quote size={20} className="text-green-600" />
                            <h3 className="font-semibold text-green-800">{t.notesPage.editor.form.bible_section_title}</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-green-800 mb-2">
                                {t.notesPage.editor.form.bible_reference_label}
                              </label>
                              <input
                                type="text"
                                value={editBibleRef}
                                onChange={(e) => setEditBibleRef(e.target.value)}
                                placeholder={t.notesPage.editor.form.bible_reference_placeholder}
                                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-green-800 mb-2">
                                {t.notesPage.editor.form.bible_quote_label}
                              </label>
                              <textarea
                                value={editBibleQuote}
                                onChange={(e) => setEditBibleQuote(e.target.value)}
                                placeholder={t.notesPage.editor.form.bible_quote_placeholder}
                                rows={4}
                                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Metadata */}
                        {editorMode === 'edit' && selectedNote && (
                          <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <span>{t.notesPage.metadata.created}: {formatDate(selectedNote.created_at)}</span>
                              </div>
                              {selectedNote.updated_at && selectedNote.updated_at !== selectedNote.created_at && (
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} />
                                  <span>{t.notesPage.metadata.updated}: {formatDate(selectedNote.updated_at)}</span>
                                </div>
                              )}
                              {!selectedNote.updated_at && (
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} />
                                  <span className="italic">{t.notesPage.metadata.not_modified}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
  );
}
