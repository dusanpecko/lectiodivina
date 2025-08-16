// src/app/rosary/[category]/page.tsx
// Stránka s zoznamom desiatkov pre kategóriu

"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useLanguage } from '@/app/components/LanguageProvider';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { 
  isValidCategory, 
  getCategoryInfo, 
  convertToRosaryDecade,
  getTotalDuration,
  LECTIO_DIVINA_STEPS_INFO
} from '@/app/lib/rosary-utils';
import { RosaryCategory, RosaryDecade, LectioDivinaRuzenec } from '@/app/types/rosary';
import DecadeList from '../components/DecadeList';
import { 
  BookOpen, 
  Clock, 
  Heart, 
  Sparkles,
  Play,
  Volume2,
  Info,
  CheckCircle
} from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const { lang } = useLanguage();
  const { supabase } = useSupabase();
  
  const category = params.category as string;
  
  // Validácia kategórie
  if (!isValidCategory(category)) {
    notFound();
  }

  const [decades, setDecades] = useState<RosaryDecade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryInfo = getCategoryInfo(category as RosaryCategory);
  const totalDuration = getTotalDuration();

  // Fetch desiatky pre kategóriu
  useEffect(() => {
    const fetchDecades = async () => {
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

        // Konverzia databázových záznamov na RosaryDecade
        const convertedDecades: RosaryDecade[] = data.map((item: LectioDivinaRuzenec, index: number) => {
          return convertToRosaryDecade(item, category as RosaryCategory, index + 1);
        });

        setDecades(convertedDecades);
      } catch (err) {
        console.error('Error fetching decades:', err);
        setError(err instanceof Error ? err.message : 'Neznáma chyba');
      } finally {
        setLoading(false);
      }
    };

    fetchDecades();
  }, [supabase, category, lang]);

  // Štatistiky
  const stats = {
    totalCount: decades.length,
    withAudio: decades.filter(d => d.fullData.audio_nahravka).length,
    withImages: decades.filter(d => d.fullData.ilustracny_obrazok).length,
    estimatedTime: decades.length * totalDuration
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Hlavička kategórie */}
      <div className="text-center mb-12">
        <div 
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg mb-6 text-white text-3xl"
          style={{ backgroundColor: categoryInfo.color }}
        >
          {categoryInfo.icon}
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          {categoryInfo.name}
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {categoryInfo.description}
        </p>
      </div>

      {/* Štatistiky */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {stats.totalCount}
          </h3>
          <p className="text-gray-600">Tajomstiev</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Volume2 size={24} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {stats.withAudio}
          </h3>
          <p className="text-gray-600">S audio</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {stats.withImages}
          </h3>
          <p className="text-gray-600">S obrázkami</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Clock size={24} className="text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {stats.estimatedTime}
          </h3>
          <p className="text-gray-600">Minút celkom</p>
        </div>
      </div>

      {/* Informácie o Lectio Divina */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
            <Info size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Lectio Divina proces
          </h2>
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Každé tajomstvo vás prevedie cez päť krokov duchovného čítania. 
          Venujte si čas na každý krok a nechajte Ducha Svätého, aby vás viedol.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {Object.values(LECTIO_DIVINA_STEPS_INFO)
            .filter(step => step.id !== 'intro')
            .map((step, index) => (
            <div key={step.id} className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg"
                style={{ backgroundColor: step.color }}
              >
                {step.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {step.description}
              </p>
              <div className="flex items-center justify-center text-xs text-gray-500">
                <Clock size={12} className="mr-1" />
                {step.duration} min
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zoznam desiatkov */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Tajomstvá ruženec
          </h2>
          {!loading && decades.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <CheckCircle size={16} className="mr-2 text-green-500" />
              {decades.length} z 5 tajomstiev dostupných
            </div>
          )}
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-2">
              Chyba pri načítavaní
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Skúsiť znovu
            </button>
          </div>
        ) : (
          <DecadeList
            decades={decades}
            category={category as RosaryCategory}
            loading={loading}
          />
        )}
      </div>

      {/* Duchovné rady */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
            <Heart size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Duchovné rady pre modlitbu
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Príprava na modlitbu
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <Sparkles size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <span>Nájdite si pokojné miesto bez rušivých vplyvov</span>
              </li>
              <li className="flex items-start">
                <Sparkles size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <span>Pozrite sa na svoju dušu a pripravte srdce</span>
              </li>
              <li className="flex items-start">
                <Sparkles size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <span>Modlite sa k Duchu Svätému o vedenie</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Počas modlitby
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <Heart size={16} className="text-purple-500 mt-1 mr-2 flex-shrink-0" />
                <span>Nechajte text hovoriť priamo k vášmu srdcu</span>
              </li>
              <li className="flex items-start">
                <Heart size={16} className="text-purple-500 mt-1 mr-2 flex-shrink-0" />
                <span>Nebojte sa ticha a pomalého tempa</span>
              </li>
              <li className="flex items-start">
                <Heart size={16} className="text-purple-500 mt-1 mr-2 flex-shrink-0" />
                <span>Rozprávajte sa s Ježišom a Máriou</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}