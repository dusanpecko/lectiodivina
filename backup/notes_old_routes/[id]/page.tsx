// app/notes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../../components/SupabaseProvider';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { formatDate } from '../../utils/dateUtils';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Trash2, 
  X, 
  BookOpen, 
  Quote, 
  FileText,
  Calendar,
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

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [note, setNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    bible_reference: '',
    bible_quote: ''
  });
  const [noteId, setNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { supabase, session, isLoading: authLoading } = useSupabase();
  const router = useRouter();

  // Unwrap params Promise
  useEffect(() => {
    params.then(({ id }) => {
      setNoteId(id);
    });
  }, [params]);

  useEffect(() => {
    if (noteId && session && supabase) {
      fetchNote();
    }
  }, [noteId, session, supabase]);

  const fetchNote = async () => {
    if (!noteId || !session || !supabase) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      
      setNote(data);
      setFormData({
        title: data.title,
        content: data.content,
        bible_reference: data.bible_reference || '',
        bible_quote: data.bible_quote || ''
      });
    } catch (error) {
      console.error('Error loading note:', error);
      router.push('/notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note || !session || !supabase) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setError(null);
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id);

      if (error) throw error;
      
      setIsEditing(false);
      await fetchNote();
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !supabase || !confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', note.id);

      if (error) throw error;
      
      router.push('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {authLoading ? 'Loading...' : 'Loading note...'}
            </h2>
          </div>
        </div>
      </Layout>
    );
  }

  if (!note) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-400 to-red-500 rounded-xl flex items-center justify-center">
              <AlertCircle size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Note not found</h2>
            <p className="text-gray-600 mb-6">The note you're looking for doesn't exist or has been deleted.</p>
            <Link href="/notes">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl">
                Back to Notes
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/notes">
                  <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200">
                    <ArrowLeft size={20} />
                  </button>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {isEditing ? 'Edit Note' : note.title}
                  </h1>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  >
                    <Edit size={20} />
                  </button>
                )}
                
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-600" />
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSave} className="space-y-6">
              {/* Title */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FileText size={16} className="mr-2" />
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Bible Reference */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <label htmlFor="bible_reference" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <BookOpen size={16} className="mr-2" />
                  Bible Reference (e.g., John 3:16)
                </label>
                <input
                  type="text"
                  id="bible_reference"
                  name="bible_reference"
                  value={formData.bible_reference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Bible Quote */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <label htmlFor="bible_quote" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Quote size={16} className="mr-2" />
                  Bible Verse
                </label>
                <textarea
                  id="bible_quote"
                  name="bible_quote"
                  value={formData.bible_quote}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                />
              </div>

              {/* Content */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FileText size={16} className="mr-2" />
                  Note Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                />
              </div>

              {/* Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 size={18} className="animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Save size={18} />
                        <span>Save Changes</span>
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    <div className="flex items-center space-x-2">
                      <X size={18} />
                      <span>Cancel</span>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Bible Reference & Quote */}
              {note.bible_reference && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-l-4 border-green-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <Quote size={20} className="text-green-600" />
                    <h3 className="text-lg font-bold text-green-800">{note.bible_reference}</h3>
                  </div>
                  {note.bible_quote && (
                    <p className="text-green-700 italic text-lg leading-relaxed">
                      "{note.bible_quote}"
                    </p>
                  )}
                </div>
              )}
              
              {/* Content */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <div className="prose prose-lg max-w-none">
                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {note.content}
                  </p>
                </div>
              </div>
              
              {/* Metadata */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Created: {formatDate(note.created_at)}</span>
                  </div>
                  {note.updated_at !== note.created_at && (
                    <div className="flex items-center space-x-2">
                      <Edit size={16} />
                      <span>Updated: {formatDate(note.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}