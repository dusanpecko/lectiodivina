// src/app/notes/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../../components/SupabaseProvider';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  X, 
  BookOpen, 
  Quote, 
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function NewNotePage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    bible_reference: '',
    bible_quote: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase, session, isLoading: authLoading } = useSupabase();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !supabase) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setError(null);
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          ...formData,
          user_id: session.user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      router.push('/notes');
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
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
              New Note
            </h1>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="Enter note title..."
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
            placeholder="e.g., John 3:16"
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
            placeholder="Enter the Bible verse..."
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
            placeholder="Write your note here..."
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
                  <span>Save Note</span>
                </div>
              )}
            </button>
            <Link href="/notes">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold"
              >
                <div className="flex items-center space-x-2">
                  <X size={18} />
                  <span>Cancel</span>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
