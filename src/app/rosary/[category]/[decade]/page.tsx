// src/app/rosary/[category]/[decade]/page.tsx
// Detail stránka desiatka - modernýthree-column slide-based design

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useLanguage } from '@/app/components/LanguageProvider';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { 
  isValidCategory, 
  isValidDecadeNumber,
  getCategoryInfo
} from '@/app/lib/rosary-utils';
import { 
  RosaryCategory, 
  LectioDivinaRuzenec
} from '@/app/types/rosary';
import { 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Eye,
  Heart,
  MessageCircle,
  Play as PlayIcon,
  Quote,
  Calendar,
  Crown,
  Headphones,
  Pause,
  SkipForward,
  X,
  RefreshCw
} from 'lucide-react';

interface Slide {
  key: string;
  title: string;
  subtitle: string;
  text: string;
  icon: React.ReactNode;
  color: string;
  step: string;
}

export default function DecadeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const { supabase } = useSupabase();
  
  const category = params.category as string;
  const decadeNumber = parseInt(params.decade as string);
  
  // Validácia parametrov
  if (!isValidCategory(category) || !isValidDecadeNumber(decadeNumber)) {
    notFound();
  }

  const [decade, setDecade] = useState<LectioDivinaRuzenec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  

  
  // Audio state
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const categoryInfo = getCategoryInfo(category as RosaryCategory);

  // Fetch desiatka z databázy
  useEffect(() => {
    const fetchDecade = async () => {
      if (!supabase) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('lectio_divina_ruzenec')
          .select('*')
          .eq('kategoria', category)
          .eq('lang', lang)
          .eq('publikovane', true)
          .order('poradie', { ascending: true });

        if (error) {
          throw new Error(`Chyba pri načítavaní: ${error.message}`);
        }

        const targetDecade = data[decadeNumber - 1];
        
        if (!targetDecade) {
          throw new Error('Desiatka nenájdený');
        }

        setDecade(targetDecade);
      } catch (err) {
        console.error('Error fetching decade:', err);
        setError(err instanceof Error ? err.message : 'Neznáma chyba');
      } finally {
        setLoading(false);
      }
    };

    fetchDecade();
  }, [supabase, category, decadeNumber, lang]);

  // Audio handling
  useEffect(() => {
    if (currentAudio) {
      const updateTime = () => {
        setCurrentTime(currentAudio.currentTime);
        setDuration(currentAudio.duration);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentSection(null);
      };

      currentAudio.addEventListener('timeupdate', updateTime);
      currentAudio.addEventListener('ended', handleEnded);
      currentAudio.addEventListener('loadedmetadata', updateTime);

      return () => {
        currentAudio.removeEventListener('timeupdate', updateTime);
        currentAudio.removeEventListener('ended', handleEnded);
        currentAudio.removeEventListener('loadedmetadata', updateTime);
      };
    }
  }, [currentAudio]);

  const playAudio = useCallback((audioUrl: string, section: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(audioUrl);
    audio.play();
    setCurrentAudio(audio);
    setIsPlaying(true);
    setCurrentSection(section);
  }, [currentAudio]);

  const pauseAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  }, [currentAudio]);

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentSection(null);
    }
  }, [currentAudio]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (decadeNumber > 1) {
      router.push(`/rosary/${category}/${decadeNumber - 1}`);
    }
  };

  const handleNext = () => {
    if (decadeNumber < 5) {
      router.push(`/rosary/${category}/${decadeNumber + 1}`);
    }
  };

  const handlePreviousDay = () => {
    // Navigate to previous category (keeping same decade number)
    const categories: RosaryCategory[] = ['joyful', 'luminous', 'sorrowful', 'glorious'];
    const currentIndex = categories.indexOf(category as RosaryCategory);
    if (currentIndex > 0) {
      router.push(`/rosary/${categories[currentIndex - 1]}/${decadeNumber}`);
    }
  };

  const handleNextDay = () => {
    // Navigate to next category (keeping same decade number)
    const categories: RosaryCategory[] = ['joyful', 'luminous', 'sorrowful', 'glorious'];
    const currentIndex = categories.indexOf(category as RosaryCategory);
    if (currentIndex < categories.length - 1) {
      router.push(`/rosary/${categories[currentIndex + 1]}/${decadeNumber}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center pt-20 pb-8 px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4"
            style={{ 
              borderColor: 'rgba(64, 70, 123, 0.2)',
              borderTopColor: '#40467b'
            }}
          />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#40467b' }}>
            Načítavam tajomstvo...
          </h2>
          <p className="text-gray-600">Pripravujem duchovnú cestu pre vás</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !decade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center pt-20 pb-8 px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#40467b' }}>
            Tajomstvo nenájdené
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Požadované tajomstvo ruženec sa nenašlo.'}
          </p>
          <button
            onClick={() => router.push('/rosary')}
            className="px-6 py-3 text-white rounded-lg transition-all hover:opacity-80 shadow-md"
            style={{ backgroundColor: '#40467b' }}
          >
            Späť na kategórie
          </button>
        </div>
      </div>
    );
  }

  // Build slides array
  const slides: Slide[] = [
    {
      key: 'intro',
      title: decade.ruzenec,
      subtitle: 'Úvod do tajomstva',
      text: decade.uvod || decade.biblicky_text,
      icon: <Quote size={24} />,
      color: '#40467b',
      step: '0/5'
    },
    decade.lectio_text && {
      key: 'lectio',
      title: 'LECTIO',
      subtitle: 'Čítanie',
      text: decade.lectio_text,
      icon: <BookOpen size={24} />,
      color: '#545a94',
      step: '1/5'
    },
    decade.meditatio_text && {
      key: 'meditatio',
      title: 'MEDITATIO',
      subtitle: 'Rozjímanie',
      text: decade.meditatio_text,
      icon: <Eye size={24} />,
      color: '#686ea3',
      step: '2/5'
    },
    decade.oratio_html && {
      key: 'oratio',
      title: 'ORATIO',
      subtitle: 'Modlitba',
      text: decade.oratio_html,
      icon: <Heart size={24} />,
      color: '#7c82b2',
      step: '3/5'
    },
    decade.contemplatio_text && {
      key: 'contemplatio',
      title: 'CONTEMPLATIO',
      subtitle: 'Kontemplácia',
      text: decade.contemplatio_text,
      icon: <MessageCircle size={24} />,
      color: '#9096c1',
      step: '4/5'
    },
    decade.actio_text && {
      key: 'actio',
      title: 'ACTIO',
      subtitle: 'Konanie',
      text: decade.actio_text,
      icon: <PlayIcon size={24} />,
      color: '#a4aad0',
      step: '5/5'
    }
  ].filter(Boolean) as Slide[];

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Three-column layout */}
        <div className="flex flex-col xl:grid xl:grid-cols-12 gap-4 min-h-[calc(100vh-120px)] xl:h-[calc(100vh-120px)]">
          
          {/* LEFT COLUMN - Info & Controls */}
          <div className="xl:col-span-3">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 xl:overflow-y-auto w-full xl:h-[calc(100vh-120px)]">
              {/* Date Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePreviousDay}
                  className="p-2 rounded-lg transition-all hover:bg-gray-100"
                  style={{ color: '#40467b' }}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-center px-2">
                  <div className="text-sm font-semibold" style={{ color: '#40467b' }}>
                    {categoryInfo.name}
                  </div>
                </div>
                <button
                  onClick={handleNextDay}
                  className="p-2 rounded-lg transition-all hover:bg-gray-100"
                  style={{ color: '#40467b' }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Title Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: categoryInfo.color }}
                  >
                    {decadeNumber}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-lg font-bold leading-tight" style={{ color: '#40467b' }}>
                      {decade.ruzenec}
                    </h1>
                    <p className="text-xs text-gray-600 mt-1">
                      {decadeNumber}. tajomstvo
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation between decades */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#40467b' }}>
                  Navigácia tajomstiev
                </h3>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={decadeNumber === 1}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                    style={{ color: '#40467b' }}
                  >
                    <ChevronLeft size={16} />
                    Predchádzajúce
                  </button>
                  <div className="text-sm font-bold" style={{ color: '#40467b' }}>
                    {decadeNumber}/5
                  </div>
                  <button
                    onClick={handleNext}
                    disabled={decadeNumber === 5}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                    style={{ color: '#40467b' }}
                  >
                    Nasledujúce
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Audio Section */}
              {decade.audio_nahravka && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Headphones size={18} style={{ color: '#40467b' }} />
                    <h3 className="font-semibold text-sm" style={{ color: '#40467b' }}>
                      Audio nahrávka
                    </h3>
                  </div>

                  {currentSection && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-900">Práve hrá</span>
                        <button
                          onClick={stopAudio}
                          className="p-1 rounded hover:bg-blue-100 transition-colors"
                        >
                          <X size={14} className="text-blue-700" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={isPlaying ? pauseAudio : () => currentAudio?.play()}
                          className="p-2 rounded-lg transition-all hover:bg-blue-100"
                          style={{ color: '#40467b' }}
                        >
                          {isPlaying ? <Pause size={20} /> : <PlayIcon size={20} />}
                        </button>
                        <button
                          onClick={stopAudio}
                          className="p-2 rounded-lg transition-all hover:bg-blue-100"
                          style={{ color: '#40467b' }}
                        >
                          <SkipForward size={18} />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="h-1 bg-blue-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-blue-700">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audio button */}
                  <button
                    onClick={() => playAudio(decade.audio_nahravka!, 'main')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:opacity-90 shadow-md"
                    style={{ backgroundColor: '#40467b' }}
                  >
                    <PlayIcon size={18} />
                    <span className="font-medium">Prehrať audio</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/rosary')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-gray-100 text-sm font-medium"
                  style={{ color: '#40467b' }}
                >
                  <Crown size={18} />
                  Všetky kategórie
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-gray-100 text-sm font-medium"
                  style={{ color: '#40467b' }}
                >
                  <RefreshCw size={18} />
                  Obnoviť
                </button>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN - Content */}
          <div className="xl:col-span-6">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl xl:overflow-hidden xl:flex xl:flex-col w-full xl:h-[calc(100vh-120px)]">
              {/* Content area */}
              <div className="xl:flex-1 xl:overflow-y-auto p-8">
                <div 
                  className="rounded-xl p-8 mb-6"
                  style={{ backgroundColor: `${currentSlideData.color}08` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="p-3 rounded-xl text-white shadow-lg"
                      style={{ backgroundColor: currentSlideData.color }}
                    >
                      {currentSlideData.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: currentSlideData.color }}>
                        {currentSlideData.title}
                      </h2>
                      <p className="text-sm text-gray-600">{currentSlideData.subtitle}</p>
                    </div>
                  </div>
                  <div 
                    className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: currentSlideData.text }}
                  />
                </div>
              </div>

              {/* Navigation footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-30"
                  style={{ color: '#40467b' }}
                >
                  <ChevronLeft size={20} />
                  <span className="font-medium">Späť</span>
                </button>
                
                <div className="text-sm font-semibold" style={{ color: '#40467b' }}>
                  {currentSlide + 1} / {slides.length}
                </div>
                
                <button
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-30"
                  style={{ color: '#40467b' }}
                >
                  <span className="font-medium">Ďalej</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Steps Navigation */}
          <div className="hidden xl:block xl:col-span-3">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 xl:flex xl:flex-col w-full xl:h-[calc(100vh-120px)]">
              <h3 className="font-bold text-lg mb-4 flex-shrink-0" style={{ color: '#40467b' }}>
                Kroky Lectio Divina
              </h3>

              {/* Steps list */}
              <div className="xl:flex-1 xl:overflow-y-auto space-y-2 mb-4">
                {slides.map((slide, index) => (
                  <button
                    key={slide.key}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      currentSlide === index
                        ? 'shadow-md transform scale-[1.02]'
                        : 'hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: currentSlide === index ? `${slide.color}15` : 'transparent',
                      borderLeft: currentSlide === index ? `3px solid ${slide.color}` : '3px solid transparent'
                    }}
                  >
                    <div 
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ 
                        backgroundColor: currentSlide === index ? slide.color : `${slide.color}20`,
                        color: currentSlide === index ? 'white' : slide.color
                      }}
                    >
                      {slide.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-semibold text-sm truncate"
                        style={{ color: currentSlide === index ? slide.color : '#374151' }}
                      >
                        {slide.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {slide.subtitle}
                      </div>
                    </div>
                    {currentSlide === index && (
                      <ChevronRight size={18} style={{ color: slide.color }} className="flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Progress bar */}
              <div className="flex-shrink-0 pt-4 border-t border-gray-200">
                <div className="h-2 bg-gray-200 rounded-full mb-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((currentSlide + 1) / slides.length) * 100}%`,
                      backgroundColor: currentSlideData.color
                    }}
                  />
                </div>
                <div className="text-center text-xs font-bold" style={{ color: '#40467b' }}>
                  {Math.round(((currentSlide + 1) / slides.length) * 100)}% hotovo
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
