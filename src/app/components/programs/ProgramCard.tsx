// src/app/components/programs/ProgramCard.tsx
import Link from "next/link";
import { Play, Clock, Video, Star, Heart, Users } from "lucide-react";
import { useState } from "react";

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
}

interface ProgramCardProps {
  program: Program;
  showCategory?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  onSave?: (programId: string) => void;
  isSaved?: boolean;
}

const CATEGORY_CONFIG = {
  'featured': { 
    name: 'Odporúčané',
    color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    lightBg: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  'sleep_stories': { 
    name: 'Usínanie',
    color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    lightBg: 'bg-indigo-50',
    textColor: 'text-indigo-700'
  },
  'meditation': { 
    name: 'Meditácie',
    color: 'bg-gradient-to-br from-green-400 to-emerald-500',
    lightBg: 'bg-green-50',
    textColor: 'text-green-700'
  },
  'prayer': { 
    name: 'Modlitby',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  'bible_study': { 
    name: 'Biblické štúdium',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    lightBg: 'bg-purple-50',
    textColor: 'text-purple-700'
  }
};

export default function ProgramCard({ 
  program, 
  showCategory = true, 
  variant = 'default',
  onSave,
  isSaved = false 
}: ProgramCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[program.category as keyof typeof CATEGORY_CONFIG];
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(program.id);
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Link href={`/programs/${program.category}/${program.slug}`}>
        <div className="group bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-4 p-4">
            {/* Small image or placeholder */}
            <div className="relative w-16 h-16 flex-shrink-0">
              {program.image_url && !imageError ? (
                <img 
                  src={program.image_url} 
                  alt={program.title}
                  className="w-full h-full object-cover rounded-lg"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={`w-full h-full ${categoryConfig?.color} rounded-lg flex items-center justify-center`}>
                  <Play size={20} className="text-white" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {program.title}
              </h3>
              {program.author && (
                <p className="text-sm text-gray-600 truncate">od {program.author}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span>{program.total_sessions} lekcií</span>
                <span>{formatDuration(program.total_duration_minutes)}</span>
              </div>
            </div>
            
            {/* Play icon */}
            <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
              <Play size={16} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <Link href={`/programs/${program.category}/${program.slug}`}>
        <div 
          className="group relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Large featured image */}
          <div className="relative h-64 overflow-hidden">
            {program.image_url && !imageError ? (
              <img 
                src={program.image_url} 
                alt={program.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-full h-full ${categoryConfig?.color} flex items-center justify-center`}>
                <Play size={48} className="text-white" />
              </div>
            )}
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Featured badge */}
            <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <Star size={14} />
              Odporúčané
            </div>
            
            {/* Save button */}
            {onSave && (
              <button
                onClick={handleSaveClick}
                className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all ${
                  isSaved 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart size={16} className={isSaved ? 'fill-current' : ''} />
              </button>
            )}
            
            {/* Play overlay */}
            <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play size={32} className="text-white ml-1" />
              </div>
            </div>
            
            {/* Bottom info overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                {program.title}
              </h3>
              {program.author && (
                <p className="text-white/90 mb-3">od {program.author}</p>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {program.description && (
              <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                {program.description}
              </p>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Video size={14} />
                  <span>{program.total_sessions} lekcií</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{formatDuration(program.total_duration_minutes)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-blue-600 group-hover:translate-x-1 transition-transform font-medium">
                <span>Začať</span>
                <Play size={14} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/programs/${program.category}/${program.slug}`}>
      <div 
        className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {program.image_url && !imageError ? (
            <img 
              src={program.image_url} 
              alt={program.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full ${categoryConfig?.color} flex items-center justify-center`}>
              <Play size={32} className="text-white" />
            </div>
          )}
          
          {/* Featured Badge */}
          {program.is_featured && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star size={12} />
              Featured
            </div>
          )}
          
          {/* Save Button */}
          {onSave && (
            <button
              onClick={handleSaveClick}
              className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                isSaved 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart size={14} className={isSaved ? 'fill-current' : ''} />
            </button>
          )}
          
          {/* Play Overlay */}
          <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play size={24} className="text-white ml-1" />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Category */}
          {showCategory && categoryConfig && (
            <div className={`inline-flex items-center gap-2 px-3 py-1 ${categoryConfig.lightBg} ${categoryConfig.textColor} rounded-full text-sm font-medium mb-3`}>
              <span>{categoryConfig.name}</span>
            </div>
          )}
          
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {program.title}
          </h3>
          
          {/* Author */}
          {program.author && (
            <p className="text-gray-600 text-sm mb-3">od {program.author}</p>
          )}
          
          {/* Description */}
          {program.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {program.description}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Video size={14} />
                <span>{program.total_sessions} lekcií</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{formatDuration(program.total_duration_minutes)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-blue-600 group-hover:translate-x-1 transition-transform">
              <span className="font-medium">Počúvať</span>
              <Play size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}