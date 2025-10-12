// src/app/components/programs/SessionList.tsx
import Link from "next/link";
import { useState } from "react";
import { 
  Play, Clock, Video, Headphones, FileText, ImageIcon,
  ChevronRight, Bookmark, BookmarkCheck,
  Calendar
} from "lucide-react";

interface Program {
  id: string;
  category: string;
  slug: string;
}

interface Session {
  id: string;
  program_id: string;
  title: string;
  description?: string;
  session_order: number;
  duration_minutes: number;
  is_published: boolean;
  created_at?: string;
}

interface SessionMedia {
  id: string;
  session_id: string;
  media_type: 'video' | 'audio' | 'text' | 'image';
  title?: string;
  content: string;
  media_order: number;
  duration_minutes?: number;
  is_published: boolean;
}

interface SessionListProps {
  program: Program;
  sessions: Session[];
  sessionMedia: Record<string, SessionMedia[]>;
  currentSessionId?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showMedia?: boolean;
  showDescription?: boolean;
  onSessionStart?: (sessionId: string) => void;
  onSessionBookmark?: (sessionId: string) => void;
  bookmarkedSessions?: string[];
  className?: string;
  loading?: boolean;
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

// Loading skeleton
const SessionListSkeleton = ({ variant }: { variant: string }) => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          {variant === 'detailed' && (
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          )}
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

// Individual Session Component
const SessionCard = ({
  session,
  program,
  media,
  isCurrent,
  variant,
  showMedia,
  showDescription,
  onSessionStart,
  onSessionBookmark,
  isBookmarked
}: {
  session: Session;
  program: Program;
  media: SessionMedia[];
  isCurrent: boolean;
  variant: 'default' | 'compact' | 'detailed';
  showMedia: boolean;
  showDescription: boolean;
  onSessionStart?: (sessionId: string) => void;
  onSessionBookmark?: (sessionId: string) => void;
  isBookmarked: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getPrimaryMediaType = (): 'video' | 'audio' | 'text' | 'image' => {
    if (media.length === 0) return 'text';
    
    // Priority: video > audio > image > text
    const priorities = { video: 4, audio: 3, image: 2, text: 1 };
    return media.sort((a, b) => priorities[b.media_type] - priorities[a.media_type])[0].media_type;
  };

  const primaryMediaType = getPrimaryMediaType();
  const mediaConfig = MEDIA_TYPE_CONFIG[primaryMediaType];
  const MediaIcon = mediaConfig.icon;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSessionBookmark?.(session.id);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSessionStart?.(session.id);
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Link href={`/programs/${program.category}/${program.slug}/${session.session_order}`}>
        <div 
          className={`group flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
            isCurrent 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Session Number */}
          <div className="relative flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              isCurrent
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
            }`}>
              {session.session_order}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium truncate transition-colors ${
              isCurrent ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'
            }`}>
              {session.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatDuration(session.duration_minutes)}</span>
              {showMedia && media.length > 0 && (
                <>
                  <span>•</span>
                  <MediaIcon size={12} className={mediaConfig.color} />
                  <span>{media.length} médií</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onSessionBookmark && (
              <button
                onClick={handleBookmarkClick}
                className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
              >
                {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              </button>
            )}
            <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/programs/${program.category}/${program.slug}/${session.session_order}`}>
      <div 
        className={`group flex items-center gap-4 p-6 mb-3 bg-white rounded-xl border transition-all duration-200 cursor-pointer ${
          isCurrent 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-100 hover:border-blue-200 hover:shadow-lg'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Session Number & Play Button */}
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
            isCurrent
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 group-hover:bg-blue-600 group-hover:text-white'
          }`}>
            {isCurrent && onSessionStart ? (
              <button onClick={handlePlayClick}>
                <Play size={16} className="ml-0.5" />
              </button>
            ) : (
              session.session_order
            )}
          </div>
          
          {/* Play Overlay for hover */}
          {!isCurrent && isHovered && (
            <div className="absolute inset-0 rounded-full bg-blue-600 flex items-center justify-center">
              <Play size={16} className="text-white ml-0.5" />
            </div>
          )}
        </div>

        {/* Session Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h3 className={`font-semibold truncate transition-colors ${
              isCurrent 
                ? 'text-blue-600' 
                : 'text-gray-900 group-hover:text-blue-600'
            }`}>
              {session.title}
            </h3>
            
            {/* Media Type Badge */}
            {showMedia && media.length > 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs flex-shrink-0 ${mediaConfig.bg} ${mediaConfig.color}`}>
                <MediaIcon size={12} />
                {media.length > 1 ? `${media.length} médií` : mediaConfig.label}
              </div>
            )}
            
            {/* Current Status Badge */}
            {isCurrent && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex-shrink-0">
                <Play size={10} />
                Prehráva
              </div>
            )}
          </div>
          
          {showDescription && session.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {session.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatDuration(session.duration_minutes)}</span>
            </div>
            {showMedia && media.length > 0 && (
              <div className="flex items-center gap-1">
                <Video size={12} />
                <span>{media.length} položiek</span>
              </div>
            )}
            {session.created_at && variant === 'detailed' && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{new Date(session.created_at).toLocaleDateString('sk-SK')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onSessionBookmark && (
            <button
              onClick={handleBookmarkClick}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'text-yellow-600 bg-yellow-100' 
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
              }`}
              title={isBookmarked ? 'Odstrániť zo záložiek' : 'Pridať do záložiek'}
            >
              {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          )}
          
          <ChevronRight size={20} className={`transition-all flex-shrink-0 ${
            isCurrent 
              ? 'text-blue-600 translate-x-1' 
              : 'text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1'
          }`} />
        </div>
      </div>
    </Link>
  );
};

export default function SessionList({
  program,
  sessions,
  sessionMedia,
  currentSessionId,
  variant = 'default',
  showMedia = true,
  showDescription = true,
  onSessionStart,
  onSessionBookmark,
  bookmarkedSessions = [],
  className = "",
  loading = false
}: SessionListProps) {
  if (loading) {
    return <SessionListSkeleton variant={variant} />;
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
        <Video size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Žiadne lekcie</h3>
        <p className="text-gray-500">
          Tento program zatiaľ neobsahuje žiadne lekcie.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 my-8 ${className}`}>
      {/* Sessions List */}
      {sessions
        .sort((a, b) => a.session_order - b.session_order)
        .map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            program={program}
            media={sessionMedia[session.id] || []}
            isCurrent={currentSessionId === session.id}
            variant={variant}
            showMedia={showMedia}
            showDescription={showDescription}
            onSessionStart={onSessionStart}
            onSessionBookmark={onSessionBookmark}
            isBookmarked={bookmarkedSessions.includes(session.id)}
          />
        ))
      }
    </div>
  );
}