// src/app/rosary/page.tsx
// Úvodná stránka rosary s kategóriami a popisom

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/components/LanguageProvider';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { translations } from '@/app/i18n';
import { 
  ROSARY_CATEGORIES, 
  getCategoryInfo, 
  getTotalDuration 
} from '@/app/lib/rosary-utils';
import { RosaryCategory } from '@/app/types/rosary';
import { 
  BookOpen, 
  Clock, 
  Heart, 
  Users, 
  Sparkles,
  ChevronRight,
  Play,
  Info,
  Star,
  Crown,
  Sun,
  Cross
} from 'lucide-react';

interface CategoryStats {
  category: RosaryCategory;
  count: number;
  hasAudio: number;
}

export default function RosaryPage() {
  const { lang } = useLanguage();
  const { supabase } = useSupabase();
  const router = useRouter();
  const t = translations[lang];

  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<RosaryCategory | null>(null);

  // Fetch štatistiky pre kategórie
  useEffect(() => {
    const fetchStats = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('lectio_divina_ruzenec')
          .select('kategoria, audio_nahravka')
          .eq('lang', lang)
          .eq('publikovane', true);

        if (error) {
          console.error('Error fetching rosary stats:', error);
          return;
        }

        // Počítanie štatistík pre každú kategóriu
        const stats: CategoryStats[] = ROSARY_CATEGORIES.map(category => {
          const categoryData = data.filter(item => item.kategoria === category);
          return {
            category,
            count: categoryData.length,
            hasAudio: categoryData.filter(item => item.audio_nahravka).length
          };
        });

        setCategoryStats(stats);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase, lang]);

  const totalDuration = getTotalDuration();

  const handleCategoryClick = (category: RosaryCategory) => {
    setSelectedCategory(category);
    // Malé oneskorenie pre animáciu
    setTimeout(() => {
      router.push(`/rosary/${category}`);
    }, 150);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Hlavička */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
          <BookOpen size={32} className="text-white" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Lectio Divina Ruženec
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Spojte tradičnú modlitbu ruženec s duchovným čítaním Božieho slova. 
          Každé tajomstvo vás prevedie cez päť krokov Lectio Divina.
        </p>
      </div>

      {/* Štatistiky */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">4</h3>
          <p className="text-gray-600">Kategórie tajomstiev</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Star size={24} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {categoryStats.reduce((sum, stat) => sum + stat.count, 0)}
          </h3>
          <p className="text-gray-600">Dostupných tajomstiev</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Clock size={24} className="text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {totalDuration} min
          </h3>
          <p className="text-gray-600">Priemerný čas na tajomstvo</p>
        </div>
      </div>

      {/* Ako sa modliť */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
            <Info size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Ako sa modliť Lectio Divina Ruženec
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📿 Tradičná štruktúra ruženec
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Úvodné modlitby (Otče náš, Zdravas Mária, Sláva Otcu)</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>5 desiatkov - každý s jedným tajomstvom</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Každý desiatka: 1x Otče náš, 10x Zdravas Mária, 1x Sláva Otcu</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📖 Lectio Divina kroky
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Lectio:</strong> Čítanie biblického textu</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Meditatio:</strong> Rozjímanie nad obsahom</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Oratio:</strong> Modlitba ruženec</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Contemplatio:</strong> Kontemplácia</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Actio:</strong> Praktické uplatnenie</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Kategórie ruženec */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Vyberte si kategóriu tajomstiev
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROSARY_CATEGORIES.map((category) => {
            const categoryInfo = getCategoryInfo(category);
            const stats = categoryStats.find(s => s.category === category);
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                disabled={loading}
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-left overflow-hidden ${
                  isSelected ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {/* Background gradient */}
                <div 
                  className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundColor: categoryInfo.color }}
                />
                
                {/* Ikona */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mb-4 shadow-lg"
                  style={{ backgroundColor: categoryInfo.color }}
                >
                  {categoryInfo.icon}
                </div>
                
                {/* Obsah */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {categoryInfo.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {categoryInfo.description}
                </p>
                
                {/* Štatistiky */}
                {stats && (
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <BookOpen size={14} className="mr-1" />
                      {stats.count} tajomstiev
                    </span>
                    {stats.hasAudio > 0 && (
                      <span className="flex items-center">
                        <Play size={14} className="mr-1" />
                        {stats.hasAudio} s audio
                      </span>
                    )}
                  </div>
                )}
                
                {/* Pokračovať button */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: categoryInfo.color }}>
                    Začať modlitbu
                  </span>
                  <ChevronRight 
                    size={20} 
                    className="group-hover:translate-x-1 transition-transform"
                    style={{ color: categoryInfo.color }}
                  />
                </div>
                
                {/* Loading overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dodatočné informácie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Duchovné prínosy */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
              <Heart size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Duchovné prínosy
            </h3>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <Sparkles size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>Hlbšie pochopenie Božieho slova</span>
            </li>
            <li className="flex items-start">
              <Sparkles size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>Pokojná a sústredená modlitba</span>
            </li>
            <li className="flex items-start">
              <Sparkles size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>Praktické uplatnenie v každodennom živote</span>
            </li>
            <li className="flex items-start">
              <Sparkles size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>Duchovný rast a zrenie</span>
            </li>
          </ul>
        </div>

        {/* Technické možnosti */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mr-3">
              <Users size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Funkcie aplikácie
            </h3>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <Play size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>Audio nahrávky pre lepšie sústredenie</span>
            </li>
            <li className="flex items-start">
              <Clock size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>Časové vedenie pre každý krok</span>
            </li>
            <li className="flex items-start">
              <BookOpen size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>Kompletné texty a vysvetlenia</span>
            </li>
            <li className="flex items-start">
              <Star size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>Postupné vedenie krok za krokom</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-gray-700 font-medium">Načítavam ruženec...</span>
          </div>
        </div>
      )}
    </div>
  );
}