// app/lectio/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../components/SupabaseProvider';
import { useLanguage } from '../components/LanguageProvider';
import { translations } from '../i18n';
import Link from 'next/link';
import Image from 'next/image';
import ErrorReportModal, { ErrorReportData } from '../components/ErrorReportModal';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  VolumeX,
  Settings,
  BookOpen,
  Heart,
  Eye,
  Headphones,
  MessageCircle,
  Plus,
  RefreshCw,
  Clock,
  Quote,
  Music,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface LectioData {
  id: number;
  datum: string;
  lang: string;
  hlava: string;
  suradnice_pismo: string;
  uvod: string;
  uvod_audio: string;
  video: string;
  modlitba_uvod: string;
  modlitba_audio: string;
  nazov_biblia_1: string;
  biblia_1: string;
  biblia_1_audio: string;
  nazov_biblia_2: string;
  biblia_2: string;
  biblia_2_audio: string;
  nazov_biblia_3: string;
  biblia_3: string;
  biblia_3_audio: string;
  lectio_text: string;
  lectio_audio: string;
  meditatio_text: string;
  meditatio_audio: string;
  oratio_text: string;
  oratio_audio: string;
  contemplatio_text: string;
  contemplatio_audio: string;
  actio_text: string;
  actio_audio: string;
  modlitba_zaver: string;
  audio_5_min: string;
  zaver: string;
  pozehnanie: string;
}

interface AudioSection {
  key: keyof LectioData;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export default function LectioPage() {
  const { supabase, session } = useSupabase();
  const { lang } = useLanguage();
  const [lectioData, setLectioData] = useState<LectioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBible, setSelectedBible] = useState<'biblia_1' | 'biblia_2' | 'biblia_3'>('biblia_1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState(false);
  const [backgroundVolume, setBackgroundVolume] = useState(0.3);
  const [selectedAudios, setSelectedAudios] = useState<Record<string, boolean>>({});
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorReportSuccess, setErrorReportSuccess] = useState(false);

  const audioSections: AudioSection[] = [
    {
      key: 'modlitba_audio',
      label: 'Modlitba',
      icon: <Heart size={16} />,
      color: 'text-red-500'
    },
    {
      key: 'biblia_1_audio',
      label: 'Biblia 1',
      icon: <BookOpen size={16} />,
      color: 'text-purple-500'
    },
    {
      key: 'biblia_2_audio',
      label: 'Biblia 2',
      icon: <BookOpen size={16} />,
      color: 'text-purple-600'
    },
    {
      key: 'biblia_3_audio',
      label: 'Biblia 3',
      icon: <BookOpen size={16} />,
      color: 'text-purple-700'
    },
    {
      key: 'lectio_audio',
      label: 'Lectio',
      icon: <BookOpen size={16} />,
      color: 'text-green-500'
    },
    {
      key: 'meditatio_audio',
      label: 'Meditatio',
      icon: <Eye size={16} />,
      color: 'text-purple-500'
    },
    {
      key: 'oratio_audio',
      label: 'Oratio',
      icon: <Heart size={16} />,
      color: 'text-orange-500'
    },
    {
      key: 'contemplatio_audio',
      label: 'Contemplatio',
      icon: <MessageCircle size={16} />,
      color: 'text-pink-500'
    },
    {
      key: 'actio_audio',
      label: 'Actio',
      icon: <Play size={16} />,
      color: 'text-teal-500'
    }
  ];

  const fetchLectioData = useCallback(async () => {
    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Skúsiť načítať pre aktuálny jazyk
      let { data, error } = await supabase
        .from('lectio')
        .select('*')
        .eq('datum', dateStr)
        .eq('lang', lang)
        .single();

      // Ak nenájde pre aktuálny jazyk, skúsiť slovenčinu
      if (error && lang !== 'sk') {
        const { data: skData, error: skError } = await supabase
          .from('lectio')
          .select('*')
          .eq('datum', dateStr)
          .eq('lang', 'sk')
          .single();
        
        if (!skError) {
          data = skData;
        }
      }

      setLectioData(data);
      
      // Inicializovať selectedAudios
      if (data) {
        const initialAudios: Record<string, boolean> = {};
        audioSections.forEach(section => {
          initialAudios[section.key] = !!(data[section.key] && data[section.key].toString().trim());
        });
        setSelectedAudios(initialAudios);
      }
    } catch (error) {
      console.error('Error fetching lectio data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedDate, lang]);

  useEffect(() => {
    fetchLectioData();
  }, [fetchLectioData]);

  const goToPreviousDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const goToNextDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const playAudio = (audioUrl: string, sectionKey: string) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }

    const audio = new Audio(audioUrl);
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentSection(null);
      setCurrentAudio(null);
      
      // Auto-play next in playlist
      const availableAudios = audioSections.filter(section => 
        selectedAudios[section.key] && lectioData?.[section.key]
      );
      const currentIndex = availableAudios.findIndex(section => section.key === sectionKey);
      if (currentIndex < availableAudios.length - 1) {
        const nextSection = availableAudios[currentIndex + 1];
        playAudio(lectioData![nextSection.key] as string, nextSection.key);
      }
    });

    audio.play();
    setCurrentAudio(audio);
    setCurrentSection(sectionKey);
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentSection(null);
      setCurrentAudio(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleErrorReport = async (data: ErrorReportData) => {
    try {
      const { error } = await supabase
        .from('error_reports')
        .insert([data]);

      if (error) throw error;

      setErrorReportSuccess(true);
      setTimeout(() => setErrorReportSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  };

  const handleAddNote = () => {
    if (!lectioData || !session) return;
    
    const bibleText = lectioData[selectedBible] || '';
    const noteData = {
      title: new Date().toLocaleDateString('sk-SK'),
      content: '',
      bible_reference: lectioData.suradnice_pismo,
      bible_quote: bibleText.substring(0, 200) + (bibleText.length > 200 ? '...' : '')
    };

    // Redirect to notes with pre-filled data
    const queryParams = new URLSearchParams({
      title: noteData.title,
      bible_reference: noteData.bible_reference,
      bible_quote: noteData.bible_quote
    });
    
    // Redirect to notes page - split view will handle creating new note
    window.location.href = `/notes`;
  };

  const Section = ({ title, subtitle, text, audioKey }: { 
    title: string; 
    subtitle?: string; 
    text: string; 
    audioKey?: keyof LectioData;
  }) => {
    if (!text) return null;
    
    const hasAudio = audioKey && lectioData?.[audioKey];
    const isCurrentlyPlaying = currentSection === audioKey && isPlaying;
    
    return (
      <div className="backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: 'rgba(64, 70, 123, 0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#40467b' }}>{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1 font-medium">{subtitle}</p>
            )}
          </div>
          {hasAudio && (
            <button
              onClick={() => {
                if (isCurrentlyPlaying) {
                  pauseAudio();
                } else {
                  playAudio(lectioData[audioKey] as string, audioKey);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-80 text-white shadow-md"
              style={{
                backgroundColor: isCurrentlyPlaying ? '#dc2626' : '#40467b'
              }}
            >
              {isCurrentlyPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span className="text-sm font-medium">{isCurrentlyPlaying ? 'Pauza' : 'Prehrať'}</span>
            </button>
          )}
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
            {text}
          </p>
        </div>
      </div>
    );
  };

  const AudioPlayer = () => {
    if (!showAudioPlayer || !lectioData) return null;
    
    const availableAudios = audioSections.filter(section => 
      selectedAudios[section.key] && lectioData[section.key]
    );
    
    return (
      <div className="fixed bottom-4 right-4 w-80 backdrop-blur-md rounded-2xl shadow-2xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(64, 70, 123, 0.2)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ color: '#40467b' }}>Audio prehrávač</h3>
          <button
            onClick={() => setShowAudioPlayer(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        {currentSection && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
            <p className="text-xs text-gray-600 mb-1">Práve sa prehráva:</p>
            <p className="font-medium" style={{ color: '#40467b' }}>
              {audioSections.find(s => s.key === currentSection)?.label}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={stopAudio}
            className="p-2 rounded-full transition-all hover:opacity-70"
            style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)', color: '#40467b' }}
          >
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={() => {
              if (isPlaying) {
                pauseAudio();
              } else if (currentAudio) {
                currentAudio.play();
                setIsPlaying(true);
              }
            }}
            className="p-4 text-white rounded-full transition-all hover:opacity-80 shadow-md"
            style={{ backgroundColor: '#40467b' }}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button
            onClick={stopAudio}
            className="p-2 rounded-full transition-all hover:opacity-70"
            style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)', color: '#40467b' }}
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        {currentAudio && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full rounded-full h-2" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
              <div 
                className="h-2 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%`, backgroundColor: '#40467b' }}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm font-bold mb-3" style={{ color: '#40467b' }}>Dostupné nahrávky:</p>
          {availableAudios.map(section => (
            <button
              key={section.key}
              onClick={() => playAudio(lectioData[section.key] as string, section.key)}
              className="w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left"
              style={{
                backgroundColor: currentSection === section.key ? 'rgba(64, 70, 123, 0.15)' : 'transparent',
                color: currentSection === section.key ? '#40467b' : '#374151'
              }}
            >
              <span className={section.color}>{section.icon}</span>
              <span className="text-sm">{section.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f5f7 0%, #e8e9f3 50%, #f5f5f7 100%)' }}>
        <div className="backdrop-blur-md rounded-2xl shadow-2xl p-12 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: 'rgba(64, 70, 123, 0.2)' }}></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: '#40467b' }}></div>
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#40467b' }}>
            Načítavam Lectio Divina...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f5f7 0%, #e8e9f3 50%, #f5f5f7 100%)' }}>
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Content */}
        {lectioData ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {(() => {
              const slides = [
                // Biblický text ako prvý slide
                {
                  key: 'bible',
                  title: lectioData[`nazov_${selectedBible}` as keyof LectioData] as string || 'BIBLICKÝ TEXT',
                  subtitle: lectioData.suradnice_pismo || 'Sväté Písmo',
                  text: lectioData[selectedBible],
                  audioKey: `${selectedBible}_audio` as keyof LectioData,
                  icon: <Quote size={24} />,
                  color: '#2d3561',
                  step: '0/5'
                },
                {
                  key: 'lectio',
                  title: 'LECTIO',
                  subtitle: 'Čítanie',
                  text: lectioData.lectio_text,
                  audioKey: 'lectio_audio' as keyof LectioData,
                  icon: <BookOpen size={24} />,
                  color: '#40467b',
                  step: '1/5'
                },
                {
                  key: 'meditatio',
                  title: 'MEDITATIO',
                  subtitle: 'Rozjímanie',
                  text: lectioData.meditatio_text,
                  audioKey: 'meditatio_audio' as keyof LectioData,
                  icon: <Eye size={24} />,
                  color: '#545a94',
                  step: '2/5'
                },
                {
                  key: 'oratio',
                  title: 'ORATIO',
                  subtitle: 'Modlitba',
                  text: lectioData.oratio_text,
                  audioKey: 'oratio_audio' as keyof LectioData,
                  icon: <Heart size={24} />,
                  color: '#686ea3',
                  step: '3/5'
                },
                {
                  key: 'contemplatio',
                  title: 'CONTEMPLATIO',
                  subtitle: 'Kontemplácia',
                  text: lectioData.contemplatio_text,
                  audioKey: 'contemplatio_audio' as keyof LectioData,
                  icon: <MessageCircle size={24} />,
                  color: '#7c82b2',
                  step: '4/5'
                },
                {
                  key: 'actio',
                  title: 'ACTIO',
                  subtitle: 'Konanie',
                  text: lectioData.actio_text,
                  audioKey: 'actio_audio' as keyof LectioData,
                  icon: <Play size={24} />,
                  color: '#9096c1',
                  step: '5/5'
                }
              ].filter(slide => slide.text);

              const currentSlideData = slides[currentSlide];
              if (!currentSlideData) return null;

              const hasAudio = currentSlideData.audioKey && lectioData[currentSlideData.audioKey];
              const isCurrentlyPlaying = currentSection === currentSlideData.audioKey && isPlaying;
              const availableAudios = audioSections.filter(section => 
                selectedAudios[section.key] && lectioData[section.key]
              );

              return (
                <>
                  {/* LEFT COLUMN - Info & Controls */}
                  <div className="xl:col-span-3">
                    <div className="backdrop-blur-md rounded-2xl shadow-lg border p-4 sticky top-24 overflow-y-auto" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(64, 70, 123, 0.15)', maxHeight: 'calc(100vh - 120px)' }}>
                        {/* Date Navigation */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar size={18} style={{ color: '#40467b' }} />
                            <span className="text-xs font-bold" style={{ color: '#40467b' }}>Dátum</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={goToPreviousDay}
                              className="p-2 rounded-lg transition-all hover:opacity-80 text-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: '#686ea3' }}
                              title="Predchádzajúci deň"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <div className="flex-1 text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
                              <span className="text-xs font-bold block" style={{ color: '#40467b' }}>
                                {selectedDate.toLocaleDateString('sk-SK', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            </div>
                            <button
                              onClick={goToNextDay}
                              className="p-2 rounded-lg transition-all hover:opacity-80 text-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: '#686ea3' }}
                              title="Nasledujúci deň"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Hlava (Title) */}
                        {lectioData.hlava && (
                          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(64, 70, 123, 0.05)' }}>
                            <h2 className="text-base font-bold leading-tight" style={{ color: '#40467b' }}>
                              {lectioData.hlava}
                            </h2>
                            {lectioData.suradnice_pismo && (
                              <p className="text-sm text-gray-600 mt-2 font-medium">
                                {lectioData.suradnice_pismo}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Bible Selection */}
                        {lang === 'sk' && (
                          <div className="mb-4">
                            <label className="text-xs font-bold mb-2 block" style={{ color: '#40467b' }}>
                              Výber biblického textu:
                            </label>
                            <select
                              value={selectedBible}
                              onChange={(e) => setSelectedBible(e.target.value as 'biblia_1' | 'biblia_2' | 'biblia_3')}
                              className="w-full px-3 py-2 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 text-sm font-medium"
                              style={{ 
                                borderColor: 'rgba(64, 70, 123, 0.2)',
                                color: '#40467b',
                                backgroundColor: 'white'
                              }}
                            >
                              {(['biblia_1', 'biblia_2', 'biblia_3'] as const).map((bible) => {
                                const title = lectioData[`nazov_${bible}` as keyof LectioData] as string;
                                const text = lectioData[bible];
                                if (!text) return null;
                                
                                return (
                                  <option key={bible} value={bible}>
                                    {title}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        )}

                        {/* Audio Playlist */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Headphones size={16} style={{ color: '#40467b' }} />
                            <h3 className="text-xs font-bold" style={{ color: '#40467b' }}>
                              Audio nahrávky
                            </h3>
                          </div>

                          {currentSection && (
                            <div className="mb-3 p-2 rounded-lg relative" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
                              <button
                                onClick={() => {
                                  stopAudio();
                                }}
                                className="absolute top-1 right-1 p-1 rounded-lg transition-all hover:opacity-80"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#40467b' }}
                                title="Zavrieť prehrávač"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                              <p className="text-xs text-gray-600 mb-1">Práve hrá:</p>
                              <p className="font-semibold text-xs pr-6" style={{ color: '#40467b' }}>
                                {audioSections.find(s => s.key === currentSection)?.label}
                              </p>
                            </div>
                          )}

                          {/* Audio Controls */}
                          {currentAudio && (
                            <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(64, 70, 123, 0.05)' }}>
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <button
                                  onClick={() => {
                                    if (isPlaying) {
                                      pauseAudio();
                                    } else if (currentAudio) {
                                      currentAudio.play();
                                      setIsPlaying(true);
                                    }
                                  }}
                                  className="p-2 text-white rounded-lg transition-all hover:opacity-80 shadow-sm"
                                  style={{ backgroundColor: '#40467b' }}
                                >
                                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                </button>
                                <button
                                  onClick={stopAudio}
                                  className="p-2 rounded-lg transition-all hover:opacity-80"
                                  style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)', color: '#40467b' }}
                                  title="Zastaviť"
                                >
                                  <SkipForward size={18} />
                                </button>
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                              </div>
                              <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
                                <div 
                                  className="h-1.5 rounded-full transition-all"
                                  style={{ width: `${(currentTime / duration) * 100}%`, backgroundColor: '#40467b' }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Playlist */}
                          <div className="space-y-1 max-h-[300px] overflow-y-auto">
                            {availableAudios.map(section => (
                              <button
                                key={section.key}
                                onClick={() => playAudio(lectioData[section.key] as string, section.key)}
                                className="w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left hover:shadow-sm"
                                style={{
                                  backgroundColor: currentSection === section.key ? 'rgba(64, 70, 123, 0.15)' : 'rgba(64, 70, 123, 0.03)',
                                  borderLeft: currentSection === section.key ? '3px solid #40467b' : '3px solid transparent'
                                }}
                              >
                                <span className={section.color}>{section.icon}</span>
                                <span className="text-xs font-medium" style={{ color: currentSection === section.key ? '#40467b' : '#374151' }}>
                                  {section.label}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'rgba(64, 70, 123, 0.1)' }}>
                            {session && (
                              <button
                                onClick={handleAddNote}
                                className="w-full flex items-center justify-center gap-2 text-white px-3 py-2 rounded-lg transition-all hover:opacity-80 shadow-sm"
                                style={{ backgroundColor: '#40467b' }}
                              >
                                <Plus size={16} />
                                <span className="text-sm font-medium">Pridať poznámku</span>
                              </button>
                            )}
                            
                            <button
                              onClick={fetchLectioData}
                              className="w-full flex items-center justify-center gap-2 text-white px-3 py-2 rounded-lg transition-all hover:opacity-80 shadow-sm"
                              style={{ backgroundColor: '#686ea3' }}
                            >
                              <RefreshCw size={16} />
                              <span className="text-sm font-medium">Obnoviť</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* MIDDLE COLUMN - Content Slide */}
                  <div className="xl:col-span-6">
                    <div className="backdrop-blur-md rounded-2xl shadow-lg border flex flex-col" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(64, 70, 123, 0.15)', height: 'calc(100vh - 120px)' }}>
                      <div className="p-6 flex flex-col flex-1 overflow-hidden">
                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto mb-6">
                          <div 
                            className="prose max-w-none p-5 rounded-xl"
                            style={{ backgroundColor: `${currentSlideData.color}08` }}
                          >
                            <h3 className="text-2xl font-bold mb-4" style={{ color: currentSlideData.color }}>
                              {currentSlideData.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4 font-medium">
                              {currentSlideData.subtitle}
                            </p>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                              {currentSlideData.text}
                            </p>
                          </div>

                          {/* Error Report Button */}
                          {session && (
                            <div className="mt-4">
                              <button
                                onClick={() => setShowErrorModal(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:opacity-80 text-sm font-medium"
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                              >
                                <AlertCircle size={16} />
                                Nahlásiť chybu v texte
                              </button>
                            </div>
                          )}

                          {/* Success Message */}
                          {errorReportSuccess && (
                            <div className="mt-4 p-3 rounded-lg animate-fade-in" style={{ backgroundColor: '#d1fae5' }}>
                              <p className="text-sm font-medium" style={{ color: '#065f46' }}>
                                ✓ Hlásenie bolo úspešne odoslané. Ďakujeme za pomoc!
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                            disabled={currentSlide === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed text-white shadow-sm"
                            style={{ backgroundColor: '#686ea3' }}
                          >
                            <ChevronLeft size={18} />
                            <span className="text-sm font-medium">Späť</span>
                          </button>

                          <div className="text-sm font-bold" style={{ color: currentSlideData.color }}>
                            {currentSlide + 1} / {slides.length}
                          </div>

                          <button
                            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                            disabled={currentSlide === slides.length - 1}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed text-white shadow-sm"
                            style={{ backgroundColor: '#686ea3' }}
                          >
                            <span className="text-sm font-medium">Ďalej</span>
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN - Steps Navigation */}
                  <div className="xl:col-span-3">
                    <div className="backdrop-blur-md rounded-2xl shadow-lg border sticky top-24 flex flex-col" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(64, 70, 123, 0.15)', maxHeight: 'calc(100vh - 120px)' }}>
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
                                  Krok {slide.step}
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
                          <div className="h-2 rounded-full mb-2" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
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
                </>
              );
            })()}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
              <BookOpen size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Lectio Divina nie je dostupná
            </h2>
            <p className="text-gray-600 mb-6">
              Pre vybraný dátum a jazyk nie je k dispozícii Lectio Divina.
            </p>
            <button
              onClick={fetchLectioData}
              className="text-white px-6 py-3 rounded-lg transition-all hover:opacity-80 shadow-md"
              style={{ backgroundColor: '#40467b' }}
            >
              Skúsiť znovu
            </button>
          </div>
        )}
      </div>

      {/* Audio Player */}
      <AudioPlayer />

      {/* Error Report Modal */}
      {session && lectioData && (() => {
        const slides = [
          {
            key: 'bible',
            title: lectioData[`nazov_${selectedBible}` as keyof LectioData] as string || 'BIBLICKÝ TEXT',
            subtitle: lectioData.suradnice_pismo || 'Sväté Písmo',
            text: lectioData[selectedBible],
          },
          {
            key: 'lectio',
            title: 'LECTIO',
            subtitle: 'Čítanie',
            text: lectioData.lectio_text,
          },
          {
            key: 'meditatio',
            title: 'MEDITATIO',
            subtitle: 'Rozjímanie',
            text: lectioData.meditatio_text,
          },
          {
            key: 'oratio',
            title: 'ORATIO',
            subtitle: 'Modlitba',
            text: lectioData.oratio_text,
          },
          {
            key: 'contemplatio',
            title: 'CONTEMPLATIO',
            subtitle: 'Kontemplácia',
            text: lectioData.contemplatio_text,
          },
          {
            key: 'actio',
            title: 'ACTIO',
            subtitle: 'Konanie',
            text: lectioData.actio_text,
          }
        ].filter(slide => slide.text);

        const currentSlideData = slides[currentSlide];
        if (!currentSlideData) return null;

        return (
          <ErrorReportModal
            isOpen={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            lectioId={lectioData.id}
            lectioDate={selectedDate.toISOString().split('T')[0]}
            stepKey={currentSlideData.key}
            stepName={`${currentSlideData.title} - ${currentSlideData.subtitle}`}
            currentText={currentSlideData.text}
            userId={session.user.id}
            userEmail={session.user.email || ''}
            onSubmit={handleErrorReport}
          />
        );
      })()}
    </div>
  );
}