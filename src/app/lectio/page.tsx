// app/lectio/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import { useSupabase } from '../components/SupabaseProvider';
import { lectioTranslations } from './translations';

import {
  AlertCircle,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Headphones,
  Heart,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Quote,
  RefreshCw,
  SkipBack,
  SkipForward,
  Volume,
  Volume2,
  VolumeX
} from 'lucide-react';
import ErrorReportModal, { ErrorReportData } from '../components/ErrorReportModal';

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
  const t = lectioTranslations[lang];
  const [lectioData, setLectioData] = useState<LectioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBible, setSelectedBible] = useState<'biblia_1' | 'biblia_2' | 'biblia_3'>('biblia_1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorReportSuccess, setErrorReportSuccess] = useState(false);
  const [audioMode, setAudioMode] = useState<'none' | 'short' | 'long'>('short');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Helper funkcia pre formátovanie dátumu do YYYY-MM-DD v lokálnom časovom pásme
  const formatDateToLocalString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchLectioData = useCallback(async () => {
    setIsLoading(true);
    try {
      const dateStr = formatDateToLocalString(selectedDate);
      
      // Skúsiť načítať pre aktuálny jazyk
      const { data: initialData, error } = await supabase
        .from('lectio')
        .select('*')
        .eq('datum', dateStr)
        .eq('lang', lang)
        .single();

      let finalData = initialData;

      // Ak nenájde pre aktuálny jazyk, skúsiť slovenčinu
      if (error && lang !== 'sk') {
        const { data: skData, error: skError } = await supabase
          .from('lectio')
          .select('*')
          .eq('datum', dateStr)
          .eq('lang', 'sk')
          .single();
        
        if (!skError) {
          finalData = skData;
        }
      }

      setLectioData(finalData);
    } catch (error) {
      console.error('Error fetching lectio data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedDate, lang]);

  useEffect(() => {
    fetchLectioData();
  }, [fetchLectioData]);

  // Auto-select first available bible when data loads
  useEffect(() => {
    if (lectioData) {
      const availableBibles = (['biblia_1', 'biblia_2', 'biblia_3'] as const).filter(bible => {
        const text = lectioData[bible];
        return text && text.trim() !== '';
      });

      // If current selectedBible is not available, switch to first available
      if (availableBibles.length > 0 && !availableBibles.includes(selectedBible)) {
        setSelectedBible(availableBibles[0]);
      }
    }
  }, [lectioData, selectedBible]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !session) {
      window.location.href = '/login?redirect=/lectio';
    }
  }, [session, isLoading]);

  // Cleanup audio when component unmounts (navigating away)
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.src = ''; // Release the audio resource
      }
    };
  }, [currentAudio]);

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
      
      // Auto-play next in playlist with optional interludes
      if (lectioData) {
        // Dynamicky vytvoríme audio sekcie s aktuálne vybranou Bibliou
        const dynamicAudioSections: AudioSection[] = [
          {
            key: 'modlitba_audio',
            label: t.audio_labels.prayer,
            icon: <Heart size={16} />,
            color: 'text-red-500'
          },
          {
            key: `${selectedBible}_audio` as keyof LectioData,
            label: lectioData[`nazov_${selectedBible}` as keyof LectioData] as string || t.bible.fallback_title,
            icon: <BookOpen size={16} />,
            color: 'text-purple-500'
          },
          {
            key: 'lectio_audio',
            label: t.audio_labels.lectio,
            icon: <BookOpen size={16} />,
            color: 'text-green-500'
          },
          {
            key: 'meditatio_audio',
            label: t.audio_labels.meditatio,
            icon: <Eye size={16} />,
            color: 'text-purple-500'
          },
          {
            key: 'oratio_audio',
            label: t.audio_labels.oratio,
            icon: <Heart size={16} />,
            color: 'text-orange-500'
          },
          {
            key: 'contemplatio_audio',
            label: t.audio_labels.contemplatio,
            icon: <MessageCircle size={16} />,
            color: 'text-pink-500'
          },
          {
            key: 'actio_audio',
            label: t.audio_labels.actio,
            icon: <Play size={16} />,
            color: 'text-teal-500'
          }
        ];
        
        const availableAudios = dynamicAudioSections.filter(section => 
          lectioData[section.key]
        );
        
        const currentIndex = availableAudios.findIndex(section => section.key === sectionKey);
        
        // Určíme, či má nasledovať prechodové audio
        const needsInterlude = currentIndex < availableAudios.length - 1;
        
        if (needsInterlude) {
          let interludeUrl = '';
          
          const nextSection = availableAudios[currentIndex + 1];
          
          // Zmapujeme audio kľúč na slide index
          const audioKeyToSlideMap: Record<string, number> = {
            [`${selectedBible}_audio`]: 0, // Bible je prvý slide
            'lectio_audio': 1,
            'meditatio_audio': 2,
            'oratio_audio': 3,
            'contemplatio_audio': 4,
            'actio_audio': 5
          };
          
          // Nastavíme správny slide pre ďalšiu sekciu
          const nextSlideIndex = audioKeyToSlideMap[nextSection.key];
          if (nextSlideIndex !== undefined) {
            setCurrentSlide(nextSlideIndex);
          }
          
          if (audioMode === 'none') {
            // Žiadne pozadie - priamo ďalšia sekcia
            playAudio(lectioData[nextSection.key] as string, nextSection.key);
            return;
          } else if (audioMode === 'short') {
            // Krátke meditačné pozadie
            // audio_null.mp3 pre všetky okrem contemplatio
            // Pre contemplatio použij lectio_full.mp3
            if (sectionKey === 'contemplatio_audio') {
              interludeUrl = 'https://unnijykbupxguogrkolj.supabase.co/storage/v1/object/public/audio-files/lectio/lectio_full.mp3';
            } else {
              interludeUrl = 'https://unnijykbupxguogrkolj.supabase.co/storage/v1/object/public/audio-files/lectio/audio_null.mp3';
            }
          } else if (audioMode === 'long') {
            // Dlhé meditačné pozadie - vždy lectio_full.mp3
            interludeUrl = 'https://unnijykbupxguogrkolj.supabase.co/storage/v1/object/public/audio-files/lectio/lectio_full.mp3';
          }
          
          // Prehrať prechodové audio a potom ďalšiu nahrávku
          const interludeAudio = new Audio(interludeUrl);
          
          interludeAudio.addEventListener('ended', () => {
            playAudio(lectioData[nextSection.key] as string, nextSection.key);
          });
          
          interludeAudio.play();
          setCurrentAudio(interludeAudio);
          setCurrentSection('interlude');
          setIsPlaying(true);
        }
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
    
    // Redirect to notes page - split view will handle creating new note
    window.location.href = `/notes`;
  };



  const AudioPlayer = () => {
    if (!showAudioPlayer || !lectioData) return null;
    
    // Dynamicky vytvoríme audio sekcie s aktuálne vybranou Bibliou
    const dynamicAudioSections: AudioSection[] = [
      {
        key: 'modlitba_audio',
        label: t.audio_labels.prayer,
        icon: <Heart size={16} />,
        color: 'text-red-500'
      },
      {
        key: `${selectedBible}_audio` as keyof LectioData,
        label: lectioData[`nazov_${selectedBible}` as keyof LectioData] as string || t.bible.biblical_text,
        icon: <BookOpen size={16} />,
        color: 'text-purple-500'
      },
      {
        key: 'lectio_audio',
        label: t.audio_labels.lectio,
        icon: <BookOpen size={16} />,
        color: 'text-green-500'
      },
      {
        key: 'meditatio_audio',
        label: t.audio_labels.meditatio,
        icon: <Eye size={16} />,
        color: 'text-purple-500'
      },
      {
        key: 'oratio_audio',
        label: t.audio_labels.oratio,
        icon: <Heart size={16} />,
        color: 'text-orange-500'
      },
      {
        key: 'contemplatio_audio',
        label: t.audio_labels.contemplatio,
        icon: <MessageCircle size={16} />,
        color: 'text-pink-500'
      },
      {
        key: 'actio_audio',
        label: t.audio_labels.actio,
        icon: <Play size={16} />,
        color: 'text-teal-500'
      }
    ];
    
    const availableAudios = dynamicAudioSections.filter(section => 
      lectioData[section.key]
    );
    
    return (
      <div className="fixed bottom-4 right-4 w-80 backdrop-blur-md rounded-2xl shadow-2xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(64, 70, 123, 0.2)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ color: '#40467b' }}>{t.audio.player_title}</h3>
          <button
            onClick={() => setShowAudioPlayer(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        {currentSection && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
            <p className="text-xs text-gray-600 mb-1">{t.audio.now_playing}</p>
            <p className="font-medium" style={{ color: '#40467b' }}>
              {dynamicAudioSections.find(s => s.key === currentSection)?.label}
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
          <p className="text-sm font-bold mb-3" style={{ color: '#40467b' }}>{t.audio.available_recordings}</p>
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

  // Show loading while checking authentication or loading data
  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f5f7 0%, #e8e9f3 50%, #f5f5f7 100%)' }}>
        <div className="backdrop-blur-md rounded-2xl shadow-2xl p-12 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: 'rgba(64, 70, 123, 0.2)' }}></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: '#40467b' }}></div>
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#40467b' }}>
            {!session ? t.loading.checking_login : t.loading.loading_lectio}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4" style={{ background: 'linear-gradient(135deg, #f5f5f7 0%, #e8e9f3 50%, #f5f5f7 100%)' }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Content */}
        <div className="flex flex-col xl:grid xl:grid-cols-12 gap-4 min-h-[calc(100vh-120px)] xl:h-[calc(100vh-120px)]">
          {lectioData ? (
            (() => {
              const slides = [
                // Biblický text ako prvý slide
                {
                  key: 'bible',
                  title: lectioData[`nazov_${selectedBible}` as keyof LectioData] as string || t.bible.biblical_text.toUpperCase(),
                  subtitle: lectioData.suradnice_pismo || t.bible.holy_scripture,
                  text: lectioData[selectedBible],
                  audioKey: `${selectedBible}_audio` as keyof LectioData,
                  icon: <Quote size={24} />,
                  color: '#2d3561',
                  step: '0/5'
                },
                {
                  key: 'lectio',
                  title: t.sections.lectio,
                  subtitle: t.sections.reading,
                  text: lectioData.lectio_text,
                  audioKey: 'lectio_audio' as keyof LectioData,
                  icon: <BookOpen size={24} />,
                  color: '#40467b',
                  step: '1/5'
                },
                {
                  key: 'meditatio',
                  title: t.sections.meditatio,
                  subtitle: t.sections.meditation,
                  text: lectioData.meditatio_text,
                  audioKey: 'meditatio_audio' as keyof LectioData,
                  icon: <Eye size={24} />,
                  color: '#545a94',
                  step: '2/5'
                },
                {
                  key: 'oratio',
                  title: t.sections.oratio,
                  subtitle: t.sections.prayer,
                  text: lectioData.oratio_text,
                  audioKey: 'oratio_audio' as keyof LectioData,
                  icon: <Heart size={24} />,
                  color: '#686ea3',
                  step: '3/5'
                },
                {
                  key: 'contemplatio',
                  title: t.sections.contemplatio,
                  subtitle: t.sections.contemplation,
                  text: lectioData.contemplatio_text,
                  audioKey: 'contemplatio_audio' as keyof LectioData,
                  icon: <MessageCircle size={24} />,
                  color: '#7c82b2',
                  step: '4/5'
                },
                {
                  key: 'actio',
                  title: t.sections.actio,
                  subtitle: t.sections.action,
                  text: lectioData.actio_text,
                  audioKey: 'actio_audio' as keyof LectioData,
                  icon: <Play size={24} />,
                  color: '#9096c1',
                  step: '5/5'
                }
              ].filter(slide => slide.text);

              const currentSlideData = slides[currentSlide];
              if (!currentSlideData) return null;

              // Dynamicky vytvoríme audio sekcie s aktuálne vybranou Bibliou
              const dynamicAudioSections: AudioSection[] = [
                {
                  key: 'modlitba_audio',
                  label: t.audio_labels.prayer,
                  icon: <Heart size={16} />,
                  color: 'text-red-500'
                },
                {
                  key: `${selectedBible}_audio` as keyof LectioData,
                  label: lectioData[`nazov_${selectedBible}` as keyof LectioData] as string || t.bible.biblical_text,
                  icon: <BookOpen size={16} />,
                  color: 'text-purple-500'
                },
                {
                  key: 'lectio_audio',
                  label: t.audio_labels.lectio,
                  icon: <BookOpen size={16} />,
                  color: 'text-green-500'
                },
                {
                  key: 'meditatio_audio',
                  label: t.audio_labels.meditatio,
                  icon: <Eye size={16} />,
                  color: 'text-purple-500'
                },
                {
                  key: 'oratio_audio',
                  label: t.audio_labels.oratio,
                  icon: <Heart size={16} />,
                  color: 'text-orange-500'
                },
                {
                  key: 'contemplatio_audio',
                  label: t.audio_labels.contemplatio,
                  icon: <MessageCircle size={16} />,
                  color: 'text-pink-500'
                },
                {
                  key: 'actio_audio',
                  label: t.audio_labels.actio,
                  icon: <Play size={16} />,
                  color: 'text-teal-500'
                }
              ];
              
              const availableAudios = dynamicAudioSections.filter(section => 
                lectioData[section.key]
              );

              return (
                <>
                  {/* LEFT COLUMN - Info & Controls */}
                  <div className="xl:col-span-3">
                    <div className="backdrop-blur-md rounded-2xl shadow-lg border p-4 xl:overflow-y-auto xl:h-[calc(100vh-120px)]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(64, 70, 123, 0.15)' }}>
                        {/* Date Navigation */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold" style={{ color: '#40467b' }}>{t.navigation.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={goToPreviousDay}
                              className="p-2 rounded-lg transition-all hover:opacity-80 text-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: '#686ea3' }}
                              title={t.navigation.previous_day}
                            >
                              <ChevronLeft size={16} />
                            </button>
                            
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 text-center p-2 rounded-lg text-xs font-bold" style={{ 
                                backgroundColor: 'rgba(64, 70, 123, 0.1)',
                                color: '#40467b'
                              }}>
                                {selectedDate.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                              </div>
                              
                              <div className="relative">
                                <input
                                  type="date"
                                  value={formatDateToLocalString(selectedDate)}
                                  onChange={(e) => {
                                    const [year, month, day] = e.target.value.split('-').map(Number);
                                    const newDate = new Date(year, month - 1, day);
                                    setSelectedDate(newDate);
                                  }}
                                  style={{ position: 'absolute', width: 0, height: 0, opacity: 0, zIndex: -1 }}
                                  id="datePickerInput"
                                />
                                <button
                                  type="button"
                                  className="p-2 rounded-lg transition-all hover:opacity-80 cursor-pointer flex items-center justify-center"
                                  style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)', color: '#40467b' }}
                                  title={t.navigation.select_date}
                                  onClick={() => {
                                    const input = document.getElementById('datePickerInput') as HTMLInputElement;
                                    if (input) {
                                      if (input.showPicker) {
                                        input.showPicker();
                                      } else {
                                        input.click();
                                      }
                                    }
                                  }}
                                >
                                  <Calendar size={16} />
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={goToNextDay}
                              className="p-2 rounded-lg transition-all hover:opacity-80 text-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: '#686ea3' }}
                              title={t.navigation.next_day}
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
                        {(() => {
                          // Zistime, koľko biblí je dostupných
                          const availableBibles = (['biblia_1', 'biblia_2', 'biblia_3'] as const).filter(bible => {
                            const text = lectioData[bible];
                            return text && text.trim() !== '';
                          });

                          // Zobrazíme dropdown len ak je viac ako jedna biblia
                          if (availableBibles.length > 1) {
                            return (
                              <div className="mb-4">
                                <label className="text-xs font-bold mb-2 block" style={{ color: '#40467b' }}>
                                  {t.bible.selection_label}
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
                                  {availableBibles.map((bible) => {
                                    const title = lectioData[`nazov_${bible}` as keyof LectioData] as string;
                                    
                                    return (
                                      <option key={bible} value={bible}>
                                        {title || `${t.bible.biblical_text} ${bible.slice(-1)}`}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Audio Playlist */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Headphones size={16} style={{ color: '#40467b' }} />
                            <h3 className="text-xs font-bold" style={{ color: '#40467b' }}>
                              {t.audio.recordings}
                            </h3>
                          </div>

                          {/* Audio Mode Selection */}
                          <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(64, 70, 123, 0.05)' }}>
                            <p className="text-xs font-bold mb-3" style={{ color: '#40467b' }}>
                              {t.audio.playback_mode}
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
                                  {isPlaying ? t.modes.stop_to_change : t.modes.no_added_audio}
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
                                  {isPlaying ? t.modes.stop_to_change : t.modes.background_short_tooltip}
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
                                  {isPlaying ? t.modes.stop_to_change : t.modes.background_long_tooltip}
                                </div>
                              </div>
                            </div>
                          </div>

                          {currentSection && (
                            <div className="mb-3 p-2 rounded-lg relative" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
                              <button
                                onClick={() => {
                                  stopAudio();
                                }}
                                className="absolute top-1 right-1 p-1 rounded-lg transition-all hover:opacity-80"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#40467b' }}
                                title={t.audio.close_player}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                              <p className="text-xs text-gray-600 mb-1">{t.audio.currently_playing}</p>
                              <p className="font-semibold text-xs pr-6" style={{ color: '#40467b' }}>
                                {currentSection === 'interlude' 
                                  ? (audioMode === 'long' ? t.modes.background_long_tooltip : t.modes.background_short_tooltip)
                                  : dynamicAudioSections.find(s => s.key === currentSection)?.label
                                }
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
                                  title={t.audio.stop}
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
                                <span className="text-sm font-medium">{t.actions.add_note}</span>
                              </button>
                            )}
                            
                            <button
                              onClick={fetchLectioData}
                              className="w-full flex items-center justify-center gap-2 text-white px-3 py-2 rounded-lg transition-all hover:opacity-80 shadow-sm"
                              style={{ backgroundColor: '#686ea3' }}
                            >
                              <RefreshCw size={16} />
                              <span className="text-sm font-medium">{t.actions.refresh}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* MIDDLE COLUMN - Content Slide */}
                  <div className="xl:col-span-6">
                    <div className="backdrop-blur-md rounded-2xl shadow-lg border flex flex-col xl:h-[calc(100vh-120px)]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(64, 70, 123, 0.15)' }}>
                      <div className="p-6 flex flex-col flex-1 overflow-hidden">
                        {/* Font Size Controls */}
                        <div className="flex items-center justify-end gap-2 mb-4">
                          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(64, 70, 123, 0.05)' }}>
                            <button
                              onClick={() => setFontSize('small')}
                              className="px-3 py-1.5 rounded-md transition-all text-xs font-bold"
                              style={{
                                backgroundColor: fontSize === 'small' ? '#40467b' : 'transparent',
                                color: fontSize === 'small' ? 'white' : '#40467b'
                              }}
                              title={t.content.font_size.small}
                            >
                              A-
                            </button>
                            <button
                              onClick={() => setFontSize('medium')}
                              className="px-3 py-1.5 rounded-md transition-all text-sm font-bold"
                              style={{
                                backgroundColor: fontSize === 'medium' ? '#40467b' : 'transparent',
                                color: fontSize === 'medium' ? 'white' : '#40467b'
                              }}
                              title={t.content.font_size.medium}
                            >
                              A
                            </button>
                            <button
                              onClick={() => setFontSize('large')}
                              className="px-3 py-1.5 rounded-md transition-all text-base font-bold"
                              style={{
                                backgroundColor: fontSize === 'large' ? '#40467b' : 'transparent',
                                color: fontSize === 'large' ? 'white' : '#40467b'
                              }}
                              title={t.content.font_size.large}
                            >
                              A+
                            </button>
                          </div>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto mb-6">
                          <div 
                            className="prose max-w-none p-5 rounded-xl"
                            style={{ backgroundColor: `${currentSlideData.color}08` }}
                          >
                            <h3 
                              className="font-bold mb-4" 
                              style={{ 
                                color: currentSlideData.color,
                                fontSize: fontSize === 'small' ? '1.25rem' : fontSize === 'large' ? '1.875rem' : '1.5rem'
                              }}
                            >
                              {currentSlideData.title}
                            </h3>
                            <p 
                              className="text-gray-600 mb-4 font-medium"
                              style={{
                                fontSize: fontSize === 'small' ? '0.813rem' : fontSize === 'large' ? '1rem' : '0.875rem'
                              }}
                            >
                              {currentSlideData.subtitle}
                            </p>
                            <p 
                              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                              style={{
                                fontSize: fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.125rem' : '1rem',
                                lineHeight: fontSize === 'small' ? '1.5' : fontSize === 'large' ? '1.75' : '1.625'
                              }}
                            >
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
                                {t.actions.report_error}
                              </button>
                            </div>
                          )}

                          {/* Success Message */}
                          {errorReportSuccess && (
                            <div className="mt-4 p-3 rounded-lg animate-fade-in" style={{ backgroundColor: '#d1fae5' }}>
                              <p className="text-sm font-medium" style={{ color: '#065f46' }}>
                                ✓ {t.messages.error_report_success}
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
                            <span className="text-sm font-medium">{t.navigation.back}</span>
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
                            <span className="text-sm font-medium">{t.navigation.next}</span>
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN - Steps Navigation */}
                  <div className="xl:col-span-3">
                    <div className="backdrop-blur-md rounded-2xl shadow-lg border flex flex-col xl:h-[calc(100vh-120px)]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(64, 70, 123, 0.15)' }}>
                      <div className="p-4 flex-shrink-0">
                        <h3 className="text-sm font-bold mb-4" style={{ color: '#40467b' }}>
                          {t.navigation.steps_title}
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
                                  {t.navigation.step_label} {slide.step}
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
                            {Math.round(((currentSlide + 1) / slides.length) * 100)}% {t.navigation.progress_complete}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()
          ) : (
            <>
              {/* LEFT COLUMN - Date Navigation Only */}
              <div className="xl:col-span-3">
                <div className="backdrop-blur-md rounded-2xl shadow-lg border p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(64, 70, 123, 0.15)' }}>
                  {/* Date Navigation */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold" style={{ color: '#40467b' }}>{t.navigation.date}</span>
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
                      
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 text-center p-2 rounded-lg text-xs font-bold" style={{ 
                          backgroundColor: 'rgba(64, 70, 123, 0.1)',
                          color: '#40467b'
                        }}>
                          {selectedDate.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                        </div>
                        
                        <div className="relative">
                          <input
                            type="date"
                            value={formatDateToLocalString(selectedDate)}
                            onChange={(e) => {
                              const [year, month, day] = e.target.value.split('-').map(Number);
                              const newDate = new Date(year, month - 1, day);
                              setSelectedDate(newDate);
                            }}
                            style={{ position: 'absolute', width: 0, height: 0, opacity: 0, zIndex: -1 }}
                            id="datePickerInputError"
                          />
                          <button
                            type="button"
                            className="p-2 rounded-lg transition-all hover:opacity-80 cursor-pointer flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)', color: '#40467b' }}
                            title={t.navigation.select_date}
                            onClick={() => {
                              const input = document.getElementById('datePickerInputError') as HTMLInputElement;
                              if (input) {
                                if (input.showPicker) {
                                  input.showPicker();
                                } else {
                                  input.click();
                                }
                              }
                            }}
                          >
                            <Calendar size={16} />
                          </button>
                        </div>
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
                </div>
              </div>

              {/* MIDDLE COLUMN - Error Message */}
              <div className="xl:col-span-6">
                <div className="backdrop-blur-md rounded-2xl shadow-lg border flex items-center justify-center xl:h-[calc(100vh-120px)]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(64, 70, 123, 0.15)' }}>
                  <div className="text-center p-12">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
                      <BookOpen size={32} style={{ color: '#40467b' }} />
                    </div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#40467b' }}>
                      {t.messages.not_available_title}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {t.messages.not_available_description}
                    </p>
                    <button
                      onClick={fetchLectioData}
                      className="text-white px-6 py-3 rounded-lg transition-all hover:opacity-80 shadow-md"
                      style={{ backgroundColor: '#40467b' }}
                    >
                      {t.actions.try_again}
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Empty */}
              <div className="xl:col-span-3"></div>
            </>
          )}
        </div>
      </div>

      {/* Audio Player */}
      <AudioPlayer />

      {/* Error Report Modal */}
      {session && lectioData && (() => {
        const slides = [
          {
            key: 'bible',
            title: lectioData[`nazov_${selectedBible}` as keyof LectioData] as string || t.bible.biblical_text.toUpperCase(),
            subtitle: lectioData.suradnice_pismo || t.bible.holy_scripture,
            text: lectioData[selectedBible],
          },
          {
            key: 'lectio',
            title: t.sections.lectio,
            subtitle: t.sections.reading,
            text: lectioData.lectio_text,
          },
          {
            key: 'meditatio',
            title: t.sections.meditatio,
            subtitle: t.sections.meditation,
            text: lectioData.meditatio_text,
          },
          {
            key: 'oratio',
            title: t.sections.oratio,
            subtitle: t.sections.prayer,
            text: lectioData.oratio_text,
          },
          {
            key: 'contemplatio',
            title: t.sections.contemplatio,
            subtitle: t.sections.contemplation,
            text: lectioData.contemplatio_text,
          },
          {
            key: 'actio',
            title: t.sections.actio,
            subtitle: t.sections.action,
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
            lectioDate={formatDateToLocalString(selectedDate)}
            stepKey={currentSlideData.key}
            stepName={`${currentSlideData.title} - ${currentSlideData.subtitle}`}
            userId={session.user.id}
            userEmail={session.user.email || ''}
            onSubmit={handleErrorReport}
          />
        );
      })()}
    </div>
  );
}