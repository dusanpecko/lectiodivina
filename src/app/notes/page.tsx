// src/app/notes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../components/SupabaseProvider';
import Link from 'next/link';
import { formatDate } from '../utils/dateUtils';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Calendar,
  FileText,
  Quote,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  bible_reference?: string;
  bible_quote?: string;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { supabase, session, isLoading: authLoading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [session, authLoading, router]);

  useEffect(() => {
    if (session && supabase) {
      fetchNotes();
    }
  }, [session, supabase]);

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

  const deleteNote = async (noteId: string) => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

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

  const handleDelete = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      await deleteNote(noteId);
    }
  };

  // Ak sa ešte načítava autentifikácia alebo nie je session
  if (authLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {authLoading ? 'Loading...' : 'Redirecting to login...'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Notes
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
              </p>
            </div>
          </div>
          
          <Link href="/notes/new">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl">
              <div className="flex items-center space-x-2">
                <Plus size={20} />
                <span>New Note</span>
              </div>
            </button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => filterNotes(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
          />
          {searchQuery && (
            <button
              onClick={() => filterNotes('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading notes...
          </h2>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
            <FileText size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </h2>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Create your first note to get started'
            }
          </p>
          {!searchQuery && (
            <Link href="/notes/new">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl">
                <div className="flex items-center space-x-2">
                  <Plus size={20} />
                  <span>Create your first note</span>
                </div>
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <Link href={`/notes/${note.id}`}>
                  <h3 className="text-xl font-bold text-gray-900 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent cursor-pointer transition-all duration-200">
                    {note.title}
                  </h3>
                </Link>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link href={`/notes/${note.id}`}>
                    <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200">
                      <Edit size={16} />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {note.content.length > 120 ? `${note.content.substring(0, 120)}...` : note.content}
              </p>
              
              {note.bible_reference && (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Quote size={16} className="text-green-600" />
                    <span className="text-green-800 font-semibold">{note.bible_reference}</span>
                  </div>
                  {note.bible_quote && (
                    <p className="text-green-700 italic text-sm">"{note.bible_quote}"</p>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar size={14} />
                <span>Created: {formatDate(note.created_at)}</span>
                {note.updated_at !== note.created_at && (
                  <>
                    <span>•</span>
                    <span>Updated: {formatDate(note.updated_at)}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
