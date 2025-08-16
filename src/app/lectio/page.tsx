// app/lectio/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../components/SupabaseProvider';
import { useLanguage } from '../components/LanguageProvider';
import { translations } from '../i18n';
import Link from 'next/link';
import Image from 'next/image';
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
  Loader2
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
      color: 'text-blue-500'
    },
    {
      key: 'biblia_2_audio',
      label: 'Biblia 2',
      icon: <BookOpen size={16} />,
      color: 'text-blue-600'
    },
    {
      key: 'biblia_3_audio',
      label: 'Biblia 3',
      icon: <BookOpen size={16} />,
      color: 'text-blue-700'
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
    
    window.location.href = `/notes/new?${queryParams.toString()}`;
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isCurrentlyPlaying
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isCurrentlyPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span className="text-sm">{isCurrentlyPlaying ? 'Pause' : 'Play'}</span>
            </button>
          )}
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
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
      <div className="fixed bottom-4 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Audio Player</h3>
          <button
            onClick={() => setShowAudioPlayer(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        {currentSection && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Now Playing:</p>
            <p className="font-medium text-gray-900">
              {audioSections.find(s => s.key === currentSection)?.label}
            </p>
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={stopAudio}
            className="p-2 rounded-full hover:bg-gray-100 transition"
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
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button
            onClick={stopAudio}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        {currentAudio && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Available Audio:</p>
          {availableAudios.map(section => (
            <button
              key={section.key}
              onClick={() => playAudio(lectioData[section.key] as string, section.key)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                currentSection === section.key 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'hover:bg-gray-50'
              }`}
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading Lectio Divina...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Lectio Divina
                </h1>
                <p className="text-gray-600 mt-1">Duchovné čítanie a rozjímanie</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {session && (
                <button
                  onClick={handleAddNote}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus size={16} />
                  Pridať poznámku
                </button>
              )}
              
              <button
                onClick={fetchLectioData}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw size={16} />
                Obnoviť
              </button>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousDay}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={20} />
              Predchádzajúci deň
            </button>
            
            <div className="flex items-center gap-3 bg-blue-100 px-6 py-3 rounded-xl">
              <Calendar size={20} className="text-blue-600" />
              <span className="text-lg font-semibold text-blue-800">
                {selectedDate.toLocaleDateString('sk-SK', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <button
              onClick={goToNextDay}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ďalší deň
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Bible Selection */}
        {lectioData && lang === 'sk' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Výber biblického textu:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['biblia_1', 'biblia_2', 'biblia_3'] as const).map((bible, index) => {
                const title = lectioData[`nazov_${bible}` as keyof LectioData] as string;
                const text = lectioData[bible];
                if (!text) return null;
                
                return (
                  <button
                    key={bible}
                    onClick={() => setSelectedBible(bible)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedBible === bible
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-900">{title}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {text.substring(0, 100)}...
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Audio Player Toggle */}
        {lectioData && audioSections.some(section => lectioData[section.key]) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Headphones size={20} className="text-blue-600" />
                <span className="font-semibold text-gray-900">Audio prehrávač</span>
              </div>
              <button
                onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Music size={16} />
                {showAudioPlayer ? 'Skryť' : 'Zobraziť'}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {lectioData ? (
          <div className="space-y-6">
            {/* Title and Scripture Reference */}
            {lectioData.hlava && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {lectioData.hlava}
                </h2>
                {lectioData.suradnice_pismo && (
                  <p className="text-lg text-gray-600 font-medium">
                    {lectioData.suradnice_pismo}
                  </p>
                )}
              </div>
            )}

            {/* Header Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/api/placehoder.png"
                alt="Lectio Divina Header"
                width={800}
                height={539}
                className="w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Bible Text */}
            {lectioData[selectedBible] && (
              <Section
                title={lectioData[`nazov_${selectedBible}` as keyof LectioData] as string || 'Biblický text'}
                text={lectioData[selectedBible]}
                audioKey={`${selectedBible}_audio` as keyof LectioData}
              />
            )}

            {/* Lectio Divina Sections */}
            <Section
              title="LECTIO"
              subtitle="Čítanie"
              text={lectioData.lectio_text}
              audioKey="lectio_audio"
            />

            <Section
              title="MEDITATIO"
              subtitle="Rozjímanie"
              text={lectioData.meditatio_text}
              audioKey="meditatio_audio"
            />

            <Section
              title="ORATIO"
              subtitle="Modlitba"
              text={lectioData.oratio_text}
              audioKey="oratio_audio"
            />

            <Section
              title="CONTEMPLATIO"
              subtitle="Kontemplácia"
              text={lectioData.contemplatio_text}
              audioKey="contemplatio_audio"
            />

            <Section
              title="ACTIO"
              subtitle="Konanie"
              text={lectioData.actio_text}
              audioKey="actio_audio"
            />
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
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Skúsiť znovu
            </button>
          </div>
        )}
      </div>

      {/* Audio Player */}
      <AudioPlayer />
    </div>
  );
}