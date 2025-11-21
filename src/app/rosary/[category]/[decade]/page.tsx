// src/app/rosary/[category]/[decade]/page.tsx
// Detail stránka desiatka - modernýthree-column slide-based design

"use client";

import { useLanguage } from '@/app/components/LanguageProvider';
import { useSupabase } from '@/app/components/SupabaseProvider';
import {
    getCategoryInfo,
    isValidCategory,
    isValidDecadeNumber
} from '@/app/lib/rosary-utils';
import {
    LectioDivinaRuzenec,
    RosaryCategory
} from '@/app/types/rosary';
import {
    BookOpen,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Crown,
    Eye,
    Headphones,
    Heart,
    MessageCircle,
    Pause,
    Play as PlayIcon,
    Quote,
    RefreshCw,
    SkipForward,
    Volume,
    Volume2,
    VolumeX,
    X
} from 'lucide-react';
import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { rosaryTranslations } from '../../translations';

interface Slide {
  key: string;
  title: string;
  subtitle: string;
  text: string;
  icon: React.ReactNode;
  color: string;
  step: string;
  audioUrl?: string;
}

export default function DecadeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const { supabase } = useSupabase();
  const t = rosaryTranslations[lang as keyof typeof rosaryTranslations] ?? rosaryTranslations.sk;
  
  const category = params?.category ? String(params.category) : "";
  const decadeNumber = params?.decade ? parseInt(String(params.decade)) : 0;
  
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
  const [audioMode, setAudioMode] = useState<'none' | 'short' | 'long'>('short');

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
          .select(`
            *,
            uvod,
            uvod_audio,
            ilustracny_obrazok,
            uvodne_modlitby,
            uvodne_modlitby_audio,
            lectio_text,
            lectio_audio,
            komentar,
            komentar_audio,
            meditatio_text,
            meditatio_audio,
            oratio_html,
            oratio_audio,
            contemplatio_text,
            contemplatio_audio,
            actio_text,
            actio_audio,
            audio_nahravka
          `)
          .eq('kategoria', category)
          .eq('lang', lang)
          .eq('publikovane', true)
          .order('poradie', { ascending: true });

        if (error) {
          throw new Error(`Chyba pri načítavaní: ${error.message}`);
        }

        const targetDecade = data[decadeNumber - 1];
        
        if (!targetDecade) {
          throw new Error(t.decadeNotFound);
        }

        setDecade(targetDecade);
      } catch (err) {
        console.error('Error fetching decade:', err);
        setError(err instanceof Error ? err.message : t.unknownError);
      } finally {
        setLoading(false);
      }
    };

    fetchDecade();
  }, [supabase, category, decadeNumber, lang, t]);

  // Helper function to get text before dash
  const getTextBeforeDash = (text: string) => {
    const dashIndex = text.indexOf('–');
    return dashIndex !== -1 ? text.substring(0, dashIndex).trim() : text;
  };

  // Build slides array with useMemo
  const slides = React.useMemo<Slide[]>(() => {
    if (!decade) return [];
    
    return [
      // 0. Úvodné modlitby
      decade.uvodne_modlitby && {
        key: 'prayers',
        title: t.steps.prayers.title,
        subtitle: t.steps.prayers.subtitle,
        text: decade.uvodne_modlitby,
        icon: <Heart size={24} />,
        color: '#2d3250',
        step: t.steps.prayers.step,
        audioUrl: decade.uvodne_modlitby_audio
      },
      // 1. Úvod do tajomstva
      {
        key: 'intro',
        title: getTextBeforeDash(decade.ruzenec),
        subtitle: t.steps.intro.title,
        text: decade.uvod || decade.biblicky_text,
        icon: <Quote size={24} />,
        color: '#40467b',
        step: t.steps.intro.step,
        audioUrl: decade.uvod_audio
      },
      // 2. Lectio - Čítanie
      decade.lectio_text && {
        key: 'lectio',
        title: t.steps.lectio.title,
        subtitle: t.steps.lectio.subtitle,
        text: decade.lectio_text,
        icon: <BookOpen size={24} />,
        color: '#545a94',
        step: t.steps.lectio.step,
        audioUrl: decade.lectio_audio
      },
      // 3. Komentár
      decade.komentar && {
        key: 'commentary',
        title: t.steps.commentary.title,
        subtitle: t.steps.commentary.subtitle,
        text: decade.komentar,
        icon: <MessageCircle size={24} />,
        color: '#606697',
        step: t.steps.commentary.step,
        audioUrl: decade.komentar_audio
      },
      // 4. Meditatio - Rozjímanie
      decade.meditatio_text && {
        key: 'meditatio',
        title: t.steps.meditatio.title,
        subtitle: t.steps.meditatio.subtitle,
        text: decade.meditatio_text,
        icon: <Eye size={24} />,
        color: '#686ea3',
        step: t.steps.meditatio.step,
        audioUrl: decade.meditatio_audio
      },
      // 5. Oratio - Modlitba
      decade.oratio_html && {
        key: 'oratio',
        title: t.steps.oratio.title,
        subtitle: t.steps.oratio.subtitle,
        text: decade.oratio_html,
        icon: <Heart size={24} />,
        color: '#7c82b2',
        step: t.steps.oratio.step,
        audioUrl: decade.oratio_audio
      },
      // 6. Contemplatio - Kontemplácia
      decade.contemplatio_text && {
        key: 'contemplatio',
        title: t.steps.contemplatio.title,
        subtitle: t.steps.contemplatio.subtitle,
        text: decade.contemplatio_text,
        icon: <Calendar size={24} />,
        color: '#9096c1',
        step: t.steps.contemplatio.step,
        audioUrl: decade.contemplatio_audio
      },
      // 7. Actio - Konanie
      decade.actio_text && {
        key: 'actio',
        title: t.steps.actio.title,
        subtitle: t.steps.actio.subtitle,
        text: decade.actio_text,
        icon: <PlayIcon size={24} />,
        color: '#a4aad0',
        step: t.steps.actio.step,
        audioUrl: decade.actio_audio
      }
    ].filter(Boolean) as Slide[];
  }, [decade, t]);

  // Dynamically map audio keys to slide indices (since some slides may not exist)
  const audioKeyToSlideMap = React.useMemo(() => {
    const map: { [key: string]: number } = {};
    slides.forEach((slide, index) => {
      map[slide.key] = index;
    });
    return map;
  }, [slides]);

  // Audio handling with auto-playlist and interludes
  useEffect(() => {
    if (!currentAudio) return;

    const updateTime = () => {
      setCurrentTime(currentAudio.currentTime);
      setDuration(currentAudio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      
      // Skip auto-play for interlude (it handles its own progression)
      if (currentSection === 'interlude') {
        return;
      }
      
      // Auto-play next section (like in lectio)
      if (currentSection) {
        // Get available audio sections
        const availableAudios = slides.filter(slide => slide.audioUrl);
        const currentIndex = availableAudios.findIndex(slide => slide.key === currentSection);
        
        if (currentIndex !== -1 && currentIndex < availableAudios.length - 1) {
          const nextSlide = availableAudios[currentIndex + 1];
          
          // Check if we need an interlude between sections
          const needsInterlude = audioMode !== 'none';
          
          if (needsInterlude) {
            let interludeUrl = '';
            
            if (audioMode === 'short') {
              // Short interlude - silent pause or short music
              // audio_null.mp3 pre všetky okrem contemplatio
              // Pre contemplatio použij lectio_full.mp3
              if (currentSection === 'contemplatio') {
                interludeUrl = 'https://unnijykbupxguogrkolj.supabase.co/storage/v1/object/public/audio-files/lectio/lectio_full.mp3';
              } else {
                interludeUrl = 'https://unnijykbupxguogrkolj.supabase.co/storage/v1/object/public/audio-files/lectio/audio_null.mp3';
              }
            } else if (audioMode === 'long') {
              // Long interlude - full music - vždy lectio_full.mp3
              interludeUrl = 'https://unnijykbupxguogrkolj.supabase.co/storage/v1/object/public/audio-files/lectio/lectio_full.mp3';
            }
            
            if (interludeUrl) {
              const interludeAudio = new Audio(interludeUrl);
              
              // Set up the ended listener for interlude BEFORE playing
              interludeAudio.addEventListener('ended', () => {
                // After interlude, play next section
                playAudio(nextSlide.audioUrl!, nextSlide.key);
                
                // Move to next slide
                const nextSlideIndex = audioKeyToSlideMap[nextSlide.key];
                if (nextSlideIndex !== undefined) {
                  setCurrentSlide(nextSlideIndex);
                }
              });
              
              interludeAudio.play().catch(err => console.error('Interlude play error:', err));
              setCurrentAudio(interludeAudio);
              setCurrentSection('interlude');
              setIsPlaying(true);
              
              return;
            }
          }
          
          // No interlude - play next directly
          playAudio(nextSlide.audioUrl!, nextSlide.key);
          
          // Move to next slide
          const nextSlideIndex = audioKeyToSlideMap[nextSlide.key];
          if (nextSlideIndex !== undefined) {
            setCurrentSlide(nextSlideIndex);
          }
        } else {
          // Last section finished
          setCurrentSection(null);
        }
      }
    };

    currentAudio.addEventListener('timeupdate', updateTime);
    currentAudio.addEventListener('ended', handleEnded);
    currentAudio.addEventListener('loadedmetadata', updateTime);

    return () => {
      currentAudio.removeEventListener('timeupdate', updateTime);
      currentAudio.removeEventListener('ended', handleEnded);
      currentAudio.removeEventListener('loadedmetadata', updateTime);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAudio, currentSection, audioMode, slides, audioKeyToSlideMap]);

  const playAudio = useCallback((audioUrl: string, section: string) => {
    // Stop current audio if playing
    setCurrentAudio(prevAudio => {
      if (prevAudio) {
        prevAudio.pause();
      }
      return prevAudio;
    });

    const audio = new Audio(audioUrl);
    audio.play().catch(err => console.error('Audio play error:', err));
    setCurrentAudio(audio);
    setIsPlaying(true);
    setCurrentSection(section);
  }, []);

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

  const skipToNext = useCallback(() => {
    if (!currentSection || currentSection === 'interlude') return;
    
    // Stop current audio
    if (currentAudio) {
      currentAudio.pause();
    }
    
    // Find next audio
    const availableAudios = slides.filter(slide => slide.audioUrl);
    const currentIndex = availableAudios.findIndex(slide => slide.key === currentSection);
    
    if (currentIndex !== -1 && currentIndex < availableAudios.length - 1) {
      const nextSlide = availableAudios[currentIndex + 1];
      
      // Play next audio immediately (bez interlude)
      playAudio(nextSlide.audioUrl!, nextSlide.key);
      
      // Move to next slide
      const nextSlideIndex = audioKeyToSlideMap[nextSlide.key];
      if (nextSlideIndex !== undefined) {
        setCurrentSlide(nextSlideIndex);
      }
    } else {
      // Was last section - stop
      stopAudio();
    }
  }, [currentAudio, currentSection, slides, audioKeyToSlideMap, playAudio, stopAudio]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentAudio || !duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    currentAudio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [currentAudio, duration]);

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
            {t.loadingMystery}
          </h2>
          <p className="text-gray-600">{t.preparingPath}</p>
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
            {t.mysteryNotFound}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || t.mysteryNotFoundDesc}
          </p>
          <button
            onClick={() => router.push('/rosary')}
            className="px-6 py-3 text-white rounded-lg transition-all hover:opacity-80 shadow-md"
            style={{ backgroundColor: '#40467b' }}
          >
            {t.backToCategories}
          </button>
        </div>
      </div>
    );
  }

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
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg"
                    style={{ 
                      backgroundColor: categoryInfo.color,
                      color: categoryInfo.textColor
                    }}
                  >
                    {decadeNumber}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-lg font-bold leading-tight" style={{ color: '#40467b' }}>
                      {decade.ruzenec}
                    </h1>
                    <p className="text-xs text-gray-600 mt-1">
                      {decadeNumber}. {t.mysteryNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation between decades */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#40467b' }}>
                  {t.mysteryNavigation}
                </h3>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={decadeNumber === 1}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                    style={{ color: '#40467b' }}
                  >
                    <ChevronLeft size={16} />
                    {t.previous}
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
                    {t.next}
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
                      {t.audioRecording}
                    </h3>
                  </div>

                  {/* Audio Mode Selector */}
                  <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(64, 70, 123, 0.05)' }}>
                    <p className="text-xs font-bold mb-3" style={{ color: '#40467b' }}>
                      {t.audioMode.title}
                    </p>
                    
                    <div className="flex items-center justify-around gap-2">
                      {/* Bez pridaného audia */}
                      <div className="relative group">
                        <label className={`block ${isPlaying ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="radio"
                            name="audioMode"
                            value="none"
                            checked={audioMode === 'none'}
                            onChange={() => setAudioMode('none')}
                            disabled={isPlaying}
                            className="sr-only"
                          />
                          <div 
                            className="p-2 rounded-lg transition-all"
                            style={{
                              backgroundColor: audioMode === 'none' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(64, 70, 123, 0.05)',
                              border: audioMode === 'none' ? '2px solid #ef4444' : '2px solid transparent',
                              opacity: isPlaying ? 0.5 : 1,
                              cursor: isPlaying ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <VolumeX 
                              size={20} 
                              style={{ 
                                color: audioMode === 'none' ? '#ef4444' : '#9ca3af'
                              }} 
                            />
                          </div>
                        </label>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {t.audioMode.none.desc}
                        </div>
                      </div>

                      {/* Meditačné pozadie - krátke */}
                      <div className="relative group">
                        <label className={`block ${isPlaying ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="radio"
                            name="audioMode"
                            value="short"
                            checked={audioMode === 'short'}
                            onChange={() => setAudioMode('short')}
                            disabled={isPlaying}
                            className="sr-only"
                          />
                          <div 
                            className="p-2 rounded-lg transition-all"
                            style={{
                              backgroundColor: audioMode === 'short' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(64, 70, 123, 0.05)',
                              border: audioMode === 'short' ? '2px solid #3b82f6' : '2px solid transparent',
                              opacity: isPlaying ? 0.5 : 1,
                              cursor: isPlaying ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <Volume 
                              size={20} 
                              style={{ 
                                color: audioMode === 'short' ? '#3b82f6' : '#9ca3af'
                              }} 
                            />
                          </div>
                        </label>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {t.audioMode.short.desc}
                        </div>
                      </div>

                      {/* Meditačné pozadie - dlhšie */}
                      <div className="relative group">
                        <label className={`block ${isPlaying ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="radio"
                            name="audioMode"
                            value="long"
                            checked={audioMode === 'long'}
                            onChange={() => setAudioMode('long')}
                            disabled={isPlaying}
                            className="sr-only"
                          />
                          <div 
                            className="p-2 rounded-lg transition-all"
                            style={{
                              backgroundColor: audioMode === 'long' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(64, 70, 123, 0.05)',
                              border: audioMode === 'long' ? '2px solid #22c55e' : '2px solid transparent',
                              opacity: isPlaying ? 0.5 : 1,
                              cursor: isPlaying ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <Volume2 
                              size={20} 
                              style={{ 
                                color: audioMode === 'long' ? '#22c55e' : '#9ca3af'
                              }} 
                            />
                          </div>
                        </label>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {t.audioMode.long.desc}
                        </div>
                      </div>
                    </div>
                  </div>

                  {currentSection && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-900">{t.nowPlaying}</span>
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
                          onClick={skipToNext}
                          className="p-2 rounded-lg transition-all hover:bg-blue-100"
                          style={{ color: '#40467b' }}
                          title={t.next}
                        >
                          <SkipForward size={18} />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div 
                          className="h-1 bg-blue-200 rounded-full overflow-hidden cursor-pointer hover:h-1.5 transition-all"
                          onClick={handleProgressClick}
                          role="progressbar"
                          aria-valuenow={currentTime}
                          aria-valuemin={0}
                          aria-valuemax={duration}
                        >
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
                </div>
              )}

              {/* Steps with Audio */}
              <div className="mb-6">
                <h3 className="text-xs font-bold mb-3" style={{ color: '#40467b' }}>
                  Kroky Lectio Divina
                </h3>
                <div className="space-y-1">
                  {slides.map((slide, index) => (
                    slide.audioUrl ? (
                      // Audio button (kombinované s navigation)
                      <button
                        key={slide.key}
                        onClick={() => {
                          if (currentSection === slide.key && isPlaying) {
                            pauseAudio();
                          } else {
                            setCurrentSlide(index);
                            playAudio(slide.audioUrl!, slide.key);
                          }
                        }}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:opacity-90"
                        style={{ 
                          backgroundColor: currentSection === slide.key && isPlaying 
                            ? `${slide.color}20` 
                            : 'rgba(64, 70, 123, 0.05)',
                          border: currentSection === slide.key && isPlaying 
                            ? `2px solid ${slide.color}` 
                            : '2px solid transparent'
                        }}
                      >
                        {/* Icon - farebná bez pozadia */}
                        <div 
                          className="flex-shrink-0"
                          style={{ color: slide.color }}
                        >
                          {React.isValidElement(slide.icon) && React.cloneElement(slide.icon as React.ReactElement<{size?: number}>, { size: 15 })}
                        </div>
                        
                        {/* Title */}
                        <div className="flex-1 min-w-0 text-left">
                          <span 
                            className="text-[11px] font-semibold block truncate leading-tight"
                            style={{ color: '#374151' }}
                          >
                            {slide.title}
                          </span>
                        </div>
                      </button>
                    ) : (
                      // Steps bez audia (len navigation button)
                      <button
                        key={slide.key}
                        onClick={() => setCurrentSlide(index)}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:bg-gray-50"
                        style={{
                          backgroundColor: currentSlide === index ? `${slide.color}08` : 'transparent',
                        }}
                      >
                        {/* Icon - farebná bez pozadia */}
                        <div 
                          className="flex-shrink-0"
                          style={{ color: slide.color }}
                        >
                          {React.isValidElement(slide.icon) && React.cloneElement(slide.icon as React.ReactElement<{size?: number}>, { size: 15 })}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span 
                            className="text-[11px] font-semibold block truncate leading-tight"
                            style={{ color: currentSlide === index ? slide.color : '#374151' }}
                          >
                            {slide.title}
                          </span>
                        </div>
                        {currentSlide === index && (
                          <ChevronRight size={12} style={{ color: slide.color }} className="flex-shrink-0" />
                        )}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/rosary')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-gray-100 text-sm font-medium"
                  style={{ color: '#40467b' }}
                >
                  <Crown size={18} />
                  {t.allCategories}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-gray-100 text-sm font-medium"
                  style={{ color: '#40467b' }}
                >
                  <RefreshCw size={18} />
                  {t.refresh}
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
                  
                  {/* Ilustračný obrázok pre Úvod */}
                  {currentSlideData.key === 'intro' && decade.ilustracny_obrazok && (
                    <div className="mb-6">
                      <Image 
                        src={decade.ilustracny_obrazok} 
                        alt={currentSlideData.title}
                        width={800}
                        height={400}
                        className="w-full h-auto rounded-lg shadow-md object-cover"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  )}
                  
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

          {/* RIGHT COLUMN - Steps Overview */}
          <div className="hidden xl:block xl:col-span-3">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border xl:flex xl:flex-col w-full xl:h-[calc(100vh-120px)]" style={{ borderColor: 'rgba(64, 70, 123, 0.15)' }}>
              <div className="p-4 flex-shrink-0">
                <h3 className="text-sm font-bold mb-4" style={{ color: '#40467b' }}>
                  Kroky Lectio Divina
                </h3>
              </div>
              
              <div className="px-4 pb-4 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.key}
                      onClick={() => setCurrentSlide(index)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm group"
                      style={{
                        backgroundColor: currentSlide === index 
                          ? `${slide.color}15` 
                          : 'rgba(64, 70, 123, 0.03)',
                        borderLeft: currentSlide === index 
                          ? `3px solid ${slide.color}` 
                          : '3px solid transparent'
                      }}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: slide.color }}
                      >
                        {slide.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-medium text-gray-500 mb-0.5">
                          {slide.step}
                        </div>
                        <div 
                          className="font-bold text-sm leading-tight"
                          style={{ color: currentSlide === index ? slide.color : '#374151' }}
                        >
                          {slide.title}
                        </div>
                      </div>
                      {currentSlide === index && (
                        <ChevronRight size={18} style={{ color: slide.color }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="p-4 pt-0 flex-shrink-0">
                <div className="pt-4 border-t" style={{ borderColor: 'rgba(64, 70, 123, 0.1)' }}>
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
    </div>
  );
}
