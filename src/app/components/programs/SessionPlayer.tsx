// src/app/components/programs/SessionPlayer.tsx
import { useSupabase } from "@/app/components/SupabaseProvider";
import { formatDateMedium } from "@/utils/dateFormatter";
import {
  ArrowLeft, ArrowRight,
  Bookmark, BookmarkCheck,
  BookOpen,
  ChevronLeft, ChevronRight,
  Clock,
  Edit3, ExternalLink,
  Eye, EyeOff,
  FileText,
  Headphones,
  ImageIcon,
  List,
  Maximize2, Minimize2,
  Plus,
  Save,
  Share,
  Video
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import MediaPlayer from "./MediaPlayer";

interface Session {
  id: string;
  title: string;
  description?: string;
  session_order: number;
  duration_minutes: number;
}

interface SessionMedia {
  id: string;
  media_type: 'video' | 'audio' | 'text' | 'image';
  title?: string;
  content: string;
  media_order: number;
  duration_minutes?: number;
  thumbnail_url?: string;
}

interface Program {
  id: string;
  title: string;
  category: string;
  slug: string;
  author?: string;
  image_url?: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  bible_reference?: string;
  bible_quote?: string;
  created_at: string;
  updated_at: string;
}

interface SessionPlayerProps {
  session: Session;
  sessionMedia: SessionMedia[];
  program: Program;
  allSessions?: Session[];
  onSessionChange?: (sessionOrder: number) => void;
  autoPlayNext?: boolean;
  showNotes?: boolean;
  bookmarkedSessions?: string[];
  onBookmark?: (sessionId: string) => void;
  className?: string;
}

const MEDIA_TYPE_CONFIG = {
  'video': { 
    icon: Video, 
    color: 'text-red-600', 
    bg: 'bg-red-100',
    label: 'Video'
  },
  'audio': { 
    icon: Headphones, 
    color: 'text-green-600', 
    bg: 'bg-green-100',
    label: 'Audio'
  },
  'text': { 
    icon: FileText, 
    color: 'text-blue-600', 
    bg: 'bg-blue-100',
    label: 'Text'
  },
  'image': { 
    icon: ImageIcon, 
    color: 'text-purple-600', 
    bg: 'bg-purple-100',
    label: 'Obrázok'
  }
};

// Text Content Component
const TextContent = ({ media }: { media: SessionMedia }) => {
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`rounded-xl p-8 transition-colors ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Text Controls */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold">
          {media.title || 'Textový obsah'}
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">A</span>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-lg">A</span>
          </div>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            {isDarkMode ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
      </div>
      
      {/* Text Content */}
      <div 
        className="prose max-w-none leading-relaxed"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: media.content }}
      />
    </div>
  );
};

// Image Content Component
const ImageContent = ({ media }: { media: SessionMedia }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl p-6">
        <div className="text-center">
          {media.title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {media.title}
            </h3>
          )}
          
          <div className="relative inline-block">
            <img
              src={media.content}
              alt={media.title || 'Obrázok'}
              className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setIsFullscreen(true)}
            />
            
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={media.content}
              alt={media.title || 'Obrázok'}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition"
            >
              <Minimize2 size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Media Navigation Component
const MediaNavigation = ({ 
  sessionMedia, 
  currentMediaIndex, 
  onMediaChange 
}: {
  sessionMedia: SessionMedia[];
  currentMediaIndex: number;
  onMediaChange: (index: number) => void;
}) => {
  if (sessionMedia.length <= 1) return null;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">
          Médium {currentMediaIndex + 1} z {sessionMedia.length}
        </h4>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMediaChange(currentMediaIndex - 1)}
            disabled={currentMediaIndex === 0}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={16} />
          </button>
          
          <button
            onClick={() => onMediaChange(currentMediaIndex + 1)}
            disabled={currentMediaIndex === sessionMedia.length - 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Media Timeline */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sessionMedia.map((media, index) => {
          const config = MEDIA_TYPE_CONFIG[media.media_type];
          const Icon = config.icon;
          const isActive = index === currentMediaIndex;
          
          return (
            <button
              key={index}
              onClick={() => onMediaChange(index)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition whitespace-nowrap ${
                isActive 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-blue-600' : config.color} />
              <span className="text-sm">
                {media.title || `${config.label} ${index + 1}`}
              </span>
              {media.duration_minutes && (
                <span className="text-xs text-gray-500">
                  {media.duration_minutes}min
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Session Navigation Component
const SessionNavigation = ({ 
  session, 
  allSessions, 
  onSessionChange 
}: {
  session: Session;
  allSessions: Session[];
  onSessionChange?: (sessionOrder: number) => void;
}) => {
  const currentIndex = allSessions.findIndex(s => s.id === session.id);
  const prevSession = currentIndex > 0 ? allSessions[currentIndex - 1] : null;
  const nextSession = currentIndex < allSessions.length - 1 ? allSessions[currentIndex + 1] : null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      {/* Session Info */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Lekcia {session.session_order}
          </span>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} z {allSessions.length}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{session.title}</h2>
        {session.description && (
          <p className="text-gray-600">{session.description}</p>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        {prevSession ? (
          <button
            onClick={() => onSessionChange?.(prevSession.session_order)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={16} />
            <div className="text-left">
              <div className="text-sm font-medium">Predchádzajúca</div>
              <div className="text-xs text-gray-600 truncate max-w-32">
                {prevSession.title}
              </div>
            </div>
          </button>
        ) : (
          <div></div>
        )}
        
        <div className="text-center">
          <div className="text-sm text-gray-600">Navigácia v programe</div>
          <div className="text-xs text-gray-500 mt-1">
            Lekcia {session.session_order} z {allSessions.length}
          </div>
        </div>
        
        {nextSession ? (
          <button
            onClick={() => onSessionChange?.(nextSession.session_order)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
          >
            <div className="text-right">
              <div className="text-sm font-medium">Ďalšia</div>
              <div className="text-xs text-blue-200 truncate max-w-32">
                {nextSession.title}
              </div>
            </div>
            <ArrowRight size={16} />
          </button>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

// Enhanced Notes Section Component
const NotesSection = ({ 
  session
}: {
  session: Session;
}) => {
  const { supabase, session: authSession } = useSupabase();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing notes for this session
  useEffect(() => {
    if (!authSession || !supabase) return;

    const loadNotes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', authSession.user.id)
          .ilike('title', `%${session.title}%`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [session.title, authSession, supabase]);

  // Save quick note
  const saveQuickNote = async () => {
    if (!newNote.trim() || !authSession || !supabase) return;

    setIsSaving(true);
    try {
      const noteData = {
        title: `Poznámka k lekcii: ${session.title}`,
        content: newNote,
        bible_reference: '',
        bible_quote: '',
        user_id: authSession.user.id,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notes')
        .insert(noteData)
        .select()
        .single();

      if (error) throw error;
      
      setNotes(prev => [data, ...prev]);
      setNewNote('');
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Vaše poznámky</h3>
        <Link 
          href="/notes"
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          <Plus size={16} />
          Nová poznámka
        </Link>
      </div>

      {/* Quick Note */}
      <div className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Rýchla poznámka k tejto lekcii..."
          className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
        />
        <div className="flex justify-end mt-2">
          <button 
            onClick={saveQuickNote}
            disabled={!newNote.trim() || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Save size={14} />
            {isSaving ? 'Ukladá sa...' : 'Uložiť'}
          </button>
        </div>
      </div>

      {/* Existing Notes */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Načítavam poznámky...</p>
          </div>
        ) : notes.length > 0 ? (
          <>
            <h4 className="text-sm font-medium text-gray-700">Existujúce poznámky ({notes.length})</h4>
            {notes.slice(0, 3).map((note) => (
              <div key={note.id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900 text-sm">{note.title}</h5>
                  <Link 
                    href="/notes"
                    className="text-blue-600 hover:text-blue-700 transition"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
                
                {note.bible_reference && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                    <BookOpen size={12} />
                    <span>{note.bible_reference}</span>
                  </div>
                )}
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {note.content}
                </p>
                
                <p className="text-xs text-gray-400">
                  {formatDateMedium(note.created_at, 'sk')}
                </p>
              </div>
            ))}
            
            {notes.length > 3 && (
              <Link 
                href="/notes"
                className="block text-center py-2 text-blue-600 hover:text-blue-700 transition text-sm"
              >
                Zobraziť všetky poznámky ({notes.length - 3} ďalších)
              </Link>
            )}
          </>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <FileText size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">Zatiaľ nemáte žiadne poznámky k tejto lekcii</p>
            <Link 
              href="/notes"
              className="inline-flex items-center gap-2 mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <Edit3 size={14} />
              Vytvoriť prvú poznámku
            </Link>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-100">
          <Link 
            href="/notes"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition text-sm"
          >
            <FileText size={16} />
            Spravovať všetky poznámky
          </Link>
        </div>
      </div>
    </div>
  );
};

// Main SessionPlayer Component
export default function SessionPlayer({
  session,
  sessionMedia,
  program,
  allSessions = [],
  onSessionChange,
  autoPlayNext = false,
  showNotes = true,
  bookmarkedSessions = [],
  onBookmark,
  className = ""
}: SessionPlayerProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(bookmarkedSessions.includes(session.id));
  const [showSessionList, setShowSessionList] = useState(false);

  const currentMedia = sessionMedia[currentMediaIndex];

  // Handle media navigation
  const handleMediaChange = useCallback((index: number) => {
    if (index >= 0 && index < sessionMedia.length) {
      setCurrentMediaIndex(index);
    }
  }, [sessionMedia.length]);

  // Handle media ended
  const handleMediaEnded = useCallback(() => {
    if (currentMediaIndex < sessionMedia.length - 1) {
      // Play next media in session
      handleMediaChange(currentMediaIndex + 1);
    } else {
      // Session completed - auto-play next session if enabled
      if (autoPlayNext && allSessions.length > 0) {
        const currentIndex = allSessions.findIndex(s => s.id === session.id);
        const nextSession = allSessions[currentIndex + 1];
        if (nextSession) {
          onSessionChange?.(nextSession.session_order);
        }
      }
    }
  }, [currentMediaIndex, sessionMedia.length, session.id, autoPlayNext, allSessions, onSessionChange, handleMediaChange]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback(() => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(session.id);
  }, [isBookmarked, session.id, onBookmark]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleMediaChange(currentMediaIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleMediaChange(currentMediaIndex + 1);
          }
          break;
        case 'KeyB':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleBookmarkToggle();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentMediaIndex, handleMediaChange, handleBookmarkToggle]);

  if (!currentMedia) {
    return (
      <div className={`bg-white rounded-xl p-12 text-center border border-gray-100 ${className}`}>
        <FileText size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Žiadny obsah</h3>
        <p className="text-gray-500">
          Táto lekcia zatiaľ neobsahuje žiadne médiá.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Session Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Lekcia {session.session_order}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
            </div>
            
            {session.description && (
              <p className="text-gray-600 mb-4">{session.description}</p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{session.duration_minutes} minút</span>
              </div>
              <div className="flex items-center gap-1">
                <Video size={16} />
                <span>{sessionMedia.length} médií</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen size={16} />
                <span>{program.title}</span>
              </div>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBookmarkToggle}
              className={`p-3 rounded-lg border transition ${
                isBookmarked 
                  ? 'border-yellow-300 bg-yellow-50 text-yellow-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
              title={isBookmarked ? 'Odstrániť zo záložiek' : 'Pridať do záložiek'}
            >
              {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
            
            <button className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 text-gray-600 transition">
              <Share size={20} />
            </button>
            
            <button 
              onClick={() => setShowSessionList(!showSessionList)}
              className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 text-gray-600 transition"
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Media Navigation */}
      <MediaNavigation
        sessionMedia={sessionMedia}
        currentMediaIndex={currentMediaIndex}
        onMediaChange={handleMediaChange}
      />

      {/* Media Player */}
      <div className="space-y-4">
        {(currentMedia.media_type === 'video' || currentMedia.media_type === 'audio') && (
          <MediaPlayer
            src={currentMedia.content}
            type={currentMedia.media_type}
            title={currentMedia.title}
            poster={currentMedia.thumbnail_url}
            onEnded={handleMediaEnded}
            showFavorite={true}
            isFavorite={isBookmarked}
            onFavorite={handleBookmarkToggle}
            showShare={true}
            showDownload={true}
          />
        )}
        
        {currentMedia.media_type === 'text' && (
          <TextContent media={currentMedia} />
        )}
        
        {currentMedia.media_type === 'image' && (
          <ImageContent media={currentMedia} />
        )}
      </div>

      {/* Session Navigation */}
      {allSessions.length > 0 && (
        <SessionNavigation
          session={session}
          allSessions={allSessions}
          onSessionChange={onSessionChange}
        />
      )}

      {/* Enhanced Notes Section */}
      {showNotes && (
        <NotesSection 
          session={session}
        />
      )}

      {/* Session List Sidebar */}
      {showSessionList && allSessions.length > 0 && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Všetky lekcie</h3>
              <button
                onClick={() => setShowSessionList(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowRight size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              {allSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSessionChange?.(s.session_order);
                    setShowSessionList(false);
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition ${
                    s.id === session.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      s.id === session.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.session_order}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{s.title}</div>
                      <div className="text-sm text-gray-500">{s.duration_minutes}min</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}