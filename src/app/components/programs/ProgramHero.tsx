// src/app/components/programs/ProgramHero.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Play, Heart, Share, Download, Star, Clock, Video, 
  Globe, Calendar, Users, BookOpen, Eye, EyeOff,
  ChevronDown, ChevronUp, Info, CheckCircle, Bookmark,
  Headphones, FileText, Copy, Facebook, Twitter, 
  MessageCircle, X, ExternalLink
} from "lucide-react";

interface Program {
  id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  image_url?: string;
  author?: string;
  lang: string;
  total_sessions: number;
  total_duration_minutes: number;
  is_featured: boolean;
  is_published: boolean;
  published_at?: string;
  created_at?: string;
}

interface ProgramProgress {
  completed_sessions: number;
  progress_percent: number;
  last_session_order?: number;
}

interface ProgramHeroProps {
  program: Program;
  progress?: ProgramProgress;
  variant?: 'default' | 'compact' | 'detailed' | 'landing';
  showActions?: boolean;
  showProgress?: boolean;
  showStats?: boolean;
  showDescription?: boolean;
  isSaved?: boolean;
  isBookmarked?: boolean;
  onSave?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  customCTA?: React.ReactNode;
  className?: string;
}

const CATEGORY_CONFIG = {
  'featured': { 
    name: 'Odporúčané',
    color: 'bg-yellow-100 text-yellow-800',
    gradient: 'from-yellow-400 to-orange-500'
  },
  'sleep_stories': { 
    name: 'Usínanie',
    color: 'bg-indigo-100 text-indigo-800',
    gradient: 'from-indigo-500 to-purple-600'
  },
  'meditation': { 
    name: 'Meditácie',
    color: 'bg-green-100 text-green-800',
    gradient: 'from-green-400 to-emerald-500'
  },
  'prayer': { 
    name: 'Modlitby',
    color: 'bg-blue-100 text-blue-800',
    gradient: 'from-blue-500 to-cyan-500'
  },
  'bible_study': { 
    name: 'Biblické štúdium',
    color: 'bg-purple-100 text-purple-800',
    gradient: 'from-purple-500 to-pink-500'
  }
} as const;

// Share Modal Component
const ShareModal = ({ 
  isOpen, 
  onClose, 
  program 
}: {
  isOpen: boolean;
  onClose: () => void;
  program: Program;
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  
  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Pozrite si tento duchovný program: ${program.title}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Zdieľať program</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Copy Link */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-3">
                <p className="text-sm font-medium text-gray-900 mb-1">Odkaz</p>
                <p className="text-sm text-gray-600 truncate">{shareUrl}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  copied 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} />
                    Skopírované
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Kopírovať
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Social Share */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">Zdieľať na sociálnych sieťach</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <Facebook size={24} className="text-blue-600 mb-2" />
                <span className="text-sm text-gray-700">Facebook</span>
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <Twitter size={24} className="text-blue-400 mb-2" />
                <span className="text-sm text-gray-700">Twitter</span>
              </button>
              
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <MessageCircle size={24} className="text-green-600 mb-2" />
                <span className="text-sm text-gray-700">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProgramHero({
  program,
  progress,
  variant = 'default',
  showActions = true,
  showProgress = true,
  showStats = true,
  showDescription = true,
  isSaved = false,
  isBookmarked = false,
  onSave,
  onBookmark,
  onShare,
  onDownload,
  customCTA,
  className = ""
}: ProgramHeroProps) {
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const categoryConfig = CATEGORY_CONFIG[program.category as keyof typeof CATEGORY_CONFIG];
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours} hodín`;
  };

  const getNextSessionUrl = () => {
    if (progress?.last_session_order) {
      return `/programs/${program.category}/${program.slug}/${progress.last_session_order + 1}`;
    }
    return `/programs/${program.category}/${program.slug}/1`;
  };

  const getCTAText = () => {
    if (progress?.progress_percent && progress.progress_percent > 0) {
      return progress.progress_percent >= 100 ? 'Zopakovať' : 'Pokračovať';
    }
    return 'Začať cestu';
  };

  const shouldTruncateDescription = program.description && program.description.length > 300;

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-100 ${className}`}>
        <div className="flex gap-6">
          {/* Image */}
          <div className="w-24 h-24 flex-shrink-0">
            {program.image_url && !imageError ? (
              <img 
                src={program.image_url} 
                alt={program.title}
                className="w-full h-full object-cover rounded-lg"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${categoryConfig?.gradient || 'from-gray-400 to-gray-600'} rounded-lg flex items-center justify-center`}>
                <Play size={24} className="text-white" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{program.title}</h2>
                {program.author && (
                  <p className="text-gray-600">od {program.author}</p>
                )}
              </div>
              
              {showActions && (
                <div className="flex gap-2">
                  {onBookmark && (
                    <button
                      onClick={onBookmark}
                      className={`p-2 rounded-lg transition ${
                        isBookmarked ? 'text-yellow-600 bg-yellow-100' : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
                    </button>
                  )}
                  
                  <Link href={getNextSessionUrl()}>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                      <Play size={16} />
                      {getCTAText()}
                    </button>
                  </Link>
                </div>
              )}
            </div>
            
            {showStats && (
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{program.total_sessions} lekcií</span>
                <span>{formatDuration(program.total_duration_minutes)}</span>
                {progress && (
                  <span>{progress.progress_percent}% dokončené</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Landing variant (for homepage)
  if (variant === 'landing') {
    return (
      <div className={`bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white rounded-2xl overflow-hidden ${className}`}>
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative p-8 md:p-12">
            <div className="max-w-4xl">
              {/* Category & Featured Badge */}
              <div className="flex items-center gap-3 mb-4">
                {categoryConfig && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {categoryConfig.name}
                  </span>
                )}
                {program.is_featured && (
                  <span className="px-4 py-2 bg-yellow-400/90 text-yellow-900 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star size={16} />
                    Odporúčané
                  </span>
                )}
              </div>
              
              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                {program.title}
              </h1>
              
              {/* Author */}
              {program.author && (
                <p className="text-xl text-blue-100 mb-6">od {program.author}</p>
              )}
              
              {/* Description */}
              {showDescription && program.description && (
                <p className="text-lg text-white/90 mb-8 max-w-2xl leading-relaxed">
                  {program.description}
                </p>
              )}
              
              {/* Stats */}
              {showStats && (
                <div className="flex items-center flex-wrap gap-6 text-white/90 mb-8">
                  <div className="flex items-center gap-2">
                    <Video size={20} />
                    <span>{program.total_sessions} lekcií</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span>{formatDuration(program.total_duration_minutes)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={20} />
                    <span>{program.lang.toUpperCase()}</span>
                  </div>
                  {program.published_at && (
                    <div className="flex items-center gap-2">
                      <Calendar size={20} />
                      <span>{new Date(program.published_at).getFullYear()}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Progress */}
              {showProgress && progress && progress.progress_percent > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                    <span>Váš pokrok</span>
                    <span>{progress.completed_sessions} z {program.total_sessions} lekcií</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="h-2 bg-white rounded-full transition-all duration-500"
                      style={{ width: `${progress.progress_percent}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              {showActions && (
                <div className="flex items-center flex-wrap gap-4">
                  {customCTA || (
                    <Link href={getNextSessionUrl()}>
                      <button className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors flex items-center gap-3 shadow-lg">
                        <Play size={24} />
                        {getCTAText()}
                      </button>
                    </Link>
                  )}
                  
                  {onSave && (
                    <button
                      onClick={onSave}
                      className={`px-6 py-4 rounded-xl font-semibold transition-all flex items-center gap-3 ${
                        isSaved 
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg' 
                          : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                      }`}
                    >
                      <Heart size={20} className={isSaved ? 'fill-current' : ''} />
                      {isSaved ? 'Uložené' : 'Uložiť'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-6 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center gap-3"
                  >
                    <Share size={20} />
                    Zdieľať
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={className}>
      <div className="relative">
        {/* Background Image with Overlay */}
        <div className="relative h-96 lg:h-[500px] overflow-hidden rounded-2xl">
          {program.image_url && !imageError ? (
            <>
              <img 
                src={program.image_url} 
                alt={program.title}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            </>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${categoryConfig?.gradient || 'from-gray-400 to-gray-600'}`}></div>
          )}
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="p-8 lg:p-12 w-full">
              <div className="max-w-4xl">
                {/* Category Badge */}
                <div className="flex items-center gap-3 mb-4">
                  {categoryConfig && (
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                      {categoryConfig.name}
                    </span>
                  )}
                  {program.is_featured && (
                    <span className="px-4 py-2 bg-yellow-400/90 text-yellow-900 rounded-full text-sm font-bold flex items-center gap-1">
                      <Star size={16} />
                      Odporúčané
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                  {program.title}
                </h1>
                
                {/* Author */}
                {program.author && (
                  <p className="text-xl text-blue-100 mb-4">
                    od {program.author}
                  </p>
                )}
                
                {/* Stats */}
                {showStats && (
                  <div className="flex items-center flex-wrap gap-6 text-white/90 mb-6">
                    <div className="flex items-center gap-2">
                      <Video size={18} />
                      <span>{program.total_sessions} lekcií</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      <span>{formatDuration(program.total_duration_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={18} />
                      <span>{program.lang.toUpperCase()}</span>
                    </div>
                    {program.published_at && (
                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <span>{new Date(program.published_at).getFullYear()}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Description */}
                {showDescription && program.description && (
                  <div className="mb-8 max-w-3xl">
                    <p className="text-lg text-white/90 leading-relaxed">
                      {shouldTruncateDescription && !showFullDescription 
                        ? `${program.description.slice(0, 300)}...`
                        : program.description
                      }
                    </p>
                    {shouldTruncateDescription && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-blue-200 hover:text-white transition mt-2 flex items-center gap-1"
                      >
                        {showFullDescription ? (
                          <div className="flex items-center gap-1">
                            <ChevronUp size={16} />
                            <span>Zobraziť menej</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <ChevronDown size={16} />
                            <span>Zobraziť viac</span>
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                )}
                
                {/* Progress */}
                {showProgress && progress && progress.progress_percent > 0 && (
                  <div className="mb-8 max-w-md">
                    <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                      <span>Váš pokrok</span>
                      <span>{progress.completed_sessions} z {program.total_sessions} lekcií</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="h-2 bg-white rounded-full transition-all duration-500"
                        style={{ width: `${progress.progress_percent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                {showActions && (
                  <div className="flex items-center flex-wrap gap-4">
                    {customCTA || (
                      <Link href={getNextSessionUrl()}>
                        <button className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-3 shadow-lg">
                          <Play size={20} />
                          {getCTAText()}
                        </button>
                      </Link>
                    )}
                    
                    {onSave && (
                      <button
                        onClick={onSave}
                        className={`px-6 py-4 rounded-xl font-semibold transition-all flex items-center gap-3 ${
                          isSaved 
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg' 
                            : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                        }`}
                      >
                        <Heart size={20} className={isSaved ? 'fill-current' : ''} />
                        {isSaved ? 'Uložené' : 'Uložiť'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-6 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center gap-3"
                    >
                      <Share size={20} />
                      Zdieľať
                    </button>
                    
                    {onDownload && (
                      <button
                        onClick={onDownload}
                        className="px-6 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center gap-3"
                      >
                        <Download size={20} />
                        Stiahnuť
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        program={program}
      />
    </div>
  );
}