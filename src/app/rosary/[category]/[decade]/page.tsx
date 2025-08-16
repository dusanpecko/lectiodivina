// src/app/rosary/[category]/[decade]/page.tsx
// Detail stránka desiatka so súvislým textom

"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useLanguage } from '@/app/components/LanguageProvider';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { 
  isValidCategory, 
  isValidDecadeNumber,
  getCategoryInfo,
  generateRosaryNavigation
} from '@/app/lib/rosary-utils';
import { 
  RosaryCategory, 
  LectioDivinaRuzenec,
  RosaryNavigation 
} from '@/app/types/rosary';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Volume2,
  VolumeX,
  Image as ImageIcon,
  User,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Bookmark,
  Share2
} from 'lucide-react';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
    if (decade?.audio_nahravka) {
      const audio = new Audio(decade.audio_nahravka);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [decade]);

  // Navigácia
  const navigation: RosaryNavigation = generateRosaryNavigation(
    category as RosaryCategory,
    decadeNumber,
    'intro'
  );

  const handlePreviousDecade = () => {
    if (navigation.previousDecade) {
      router.push(`/rosary/${navigation.previousDecade.category}/${navigation.previousDecade.number}`);
    }
  };

  const handleNextDecade = () => {
    if (navigation.nextDecade) {
      router.push(`/rosary/${navigation.nextDecade.category}/${navigation.nextDecade.number}`);
    }
  };

  const handlePlayPause = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: decade?.ruzenec,
          text: `${categoryInfo.name} - ${decade?.ruzenec}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Helper function to render HTML content
  const renderHtmlContent = (htmlContent: string) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center max-w-md w-full mx-4 border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Načítavam tajomstvo...
          </h2>
          <p className="text-gray-600">
            Pripravujem duchovnú cestu pre vás
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !decade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center max-w-md w-full mx-4 border border-white/20">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Tajomstvo nenájdené
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Požadované tajomstvo ruženec sa nenašlo.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(`/rosary/${category}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Späť na kategóriu
            </button>
            <button
              onClick={() => router.push('/rosary')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Všetky ruženec
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hlavička s akciovými tlačidlami */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300"
                style={{ backgroundColor: categoryInfo.color }}
              >
                {decadeNumber}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  {categoryInfo.name}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  {decade.ruzenec}
                </h1>
                <p className="text-gray-600 mt-2">
                  {decadeNumber}. tajomstvo • Duchovná meditácia
                </p>
              </div>
            </div>
            
            {/* Akčné tlačidlá */}
            <div className="flex items-center space-x-3">
              {decade.audio_nahravka && (
                <button
                  onClick={handlePlayPause}
                  className="flex items-center space-x-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-medium"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  <span>{isPlaying ? 'Pozastaviť' : 'Prehrať'}</span>
                </button>
              )}
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-3 rounded-xl transition-colors shadow-lg ${
                  isBookmarked 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Hlavný obsah - súvislý text */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          
          {/* Obrázok ak existuje */}
          {decade.ilustracny_obrazok && (
            <div className="relative">
              <img 
                src={decade.ilustracny_obrazok} 
                alt={`Ilustrácia pre ${decade.ruzenec}`}
                className="w-full h-64 sm:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}

          <div className="p-8 sm:p-12">
            {/* Biblický text - zvýraznený */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-10 border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <BookOpen className="text-blue-600 mr-3" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">
                  Božie slovo
                </h2>
              </div>
              <div className="text-lg text-gray-700 leading-relaxed font-medium italic">
                {renderHtmlContent(decade.biblicky_text)}
              </div>
            </div>

            {/* Úvod do tajomstva */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
                Úvod do tajomstva
              </h2>
              <div className="text-lg text-gray-700 leading-relaxed prose prose-lg max-w-none">
                {renderHtmlContent(decade.uvod)}
              </div>
            </div>
            {/* Dynamické zobrazenie všetkých textových polí */}
            {Object.entries(decade as any).map(([key, value]) => {
              // Preskočíme základné polia, ktoré už zobrazujeme
              const skipFields = [
                'id', 'created_at', 'updated_at', 'kategoria', 'lang', 'publikovane', 
                'poradie', 'ruzenec', 'biblicky_text', 'uvod', 'autor', 'ilustracny_obrazok', 'audio_nahravka'
              ];
              
              if (skipFields.includes(key) || !value || typeof value !== 'string' || value.trim() === '') {
                return null;
              }

              // Určenie farby a názvu sekcie
              const getSectionInfo = (fieldName: string) => {
                const sections: Record<string, { name: string; color: string }> = {
                  // === VAŠE VLASTNÉ NÁZVY SEKCIÍ ===
                  // Sem pridajte svoje názvy pre polia z databázy:
                  'uvodne_modlitby': { name: 'Úvod', color: 'from-blue-500 to-purple-500' },
                  'lectio_text': { name: 'Lectio', color: 'from-blue-500 to-purple-500' },
                  'meditatio_text': { name: 'Meditatio', color: 'from-blue-500 to-purple-500' },
                  'oratio_html': { name: 'Oratio', color: 'from-blue-500 to-purple-500' },
                  'contemplatio_text': { name: 'Contemplatio', color: 'from-blue-500 to-purple-500' },
                  'actio_text': { name: 'Actio', color: 'from-blue-500 to-purple-500' },
                  
                  // 'dalsi_stlpec': { name: 'Váš názov', color: 'from-green-500 to-teal-500' },
                  // 'este_jeden': { name: 'Ďalší názov', color: 'from-yellow-500 to-orange-500' },
                  
                  // === PREDVOLENÉ LECTIO DIVINA KROKY ===
                  'lectio': { name: 'Lectio - Čítanie', color: 'from-green-500 to-teal-500' },
                  'meditatio': { name: 'Meditatio - Rozjímanie', color: 'from-yellow-500 to-orange-500' },
                  'oratio': { name: 'Oratio - Modlitba', color: 'from-purple-500 to-pink-500' },
                  'contemplatio': { name: 'Contemplatio - Kontemplatívne rozjímanie', color: 'from-red-500 to-rose-500' },
                  
                  // === BEŽNÉ POLIA ===
                  'zaver': { name: 'Záver', color: 'from-indigo-500 to-blue-500' },
                  'reflexia': { name: 'Reflexia', color: 'from-cyan-500 to-blue-500' },
                  'modlitba': { name: 'Modlitba', color: 'from-violet-500 to-purple-500' },
                  'rozjimanie': { name: 'Rozjímanie', color: 'from-emerald-500 to-green-500' },
                  'aplikacia': { name: 'Aplikácia do života', color: 'from-orange-500 to-red-500' },
                  'otazky': { name: 'Otázky na zamyslenie', color: 'from-teal-500 to-cyan-500' },
                  'poznamky': { name: 'Poznámky', color: 'from-gray-500 to-slate-500' }
                };
                
                // Fallback - automaticky formátuje názov
                return sections[fieldName] || { 
                  name: fieldName
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' '), 
                  color: 'from-gray-500 to-gray-600' 
                };
              };

              const sectionInfo = getSectionInfo(key);

              return (
                <div key={key} className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className={`w-2 h-8 bg-gradient-to-b ${sectionInfo.color} rounded-full mr-4`}></div>
                    {sectionInfo.name}
                  </h2>
                  <div className="text-lg text-gray-700 leading-relaxed prose prose-lg max-w-none">
                    {renderHtmlContent(value as string)}
                  </div>
                </div>
              );
            })}

            {/* Ak nie sú žiadne dodatočné sekcie, zobrazíme informáciu */}
            {Object.entries(decade as any).filter(([key, value]) => {
              const skipFields = [
                'id', 'created_at', 'updated_at', 'kategoria', 'lang', 'publikovane', 
                'poradie', 'ruzenec', 'biblicky_text', 'uvod', 'autor', 'ilustracny_obrazok', 'audio_nahravka'
              ];
              return !skipFields.includes(key) && value && typeof value === 'string' && value.trim() !== '';
            }).length === 0 && (
              <div className="mb-10 p-6 bg-gray-50 rounded-2xl text-center">
                <p className="text-gray-600">
                  <em>Tento desiatka obsahuje len základný úvod a biblický text.</em>
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t border-gray-200 pt-8 mt-12">
              {decade.autor && (
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full">
                  <User size={16} className="mr-2" />
                  <span>{decade.autor}</span>
                </div>
              )}
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full">
                <Calendar size={16} className="mr-2" />
                <span>{new Date(decade.created_at).toLocaleDateString('sk-SK')}</span>
              </div>
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full">
                <Clock size={16} className="mr-2" />
                <span>~15-20 min modlitby</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigácia medzi desiatkami */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mt-8 border border-white/20">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousDecade}
              disabled={!navigation.previousDecade}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-colors font-medium ${
                navigation.previousDecade
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowLeft size={20} />
              <span>Predchádzajúce</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/rosary/${category}`)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors shadow-md font-medium"
              >
                <BookOpen size={20} />
                <span>Všetky tajomstvá</span>
              </button>
            </div>
            
            <button
              onClick={handleNextDecade}
              disabled={!navigation.nextDecade}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-colors font-medium ${
                navigation.nextDecade
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Ďalšie</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Floating audio player - ak je audio dostupné */}
        {decade.audio_nahravka && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={handlePlayPause}
              className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
              }`}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}