// src/app/rosary/page.tsx
// Úvodná landing page pre Ruženec s moderným dizajnom

"use client";

import { useLanguage } from '@/app/components/LanguageProvider';
import { useSupabase } from '@/app/components/SupabaseProvider';
import {
  ROSARY_CATEGORIES,
  getCategoryInfo
} from '@/app/lib/rosary-utils';
import { RosaryCategory } from '@/app/types/rosary';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cross,
  Crown,
  Eye,
  Headphones,
  Heart,
  Sparkles,
  Star,
  Sun
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { rosaryTranslations } from './translations';

interface CategoryStats {
  category: RosaryCategory;
  count: number;
  hasAudio: number;
}

export default function RosaryPage() {
  const { lang } = useLanguage();
  const { supabase } = useSupabase();
  const router = useRouter();
  const t = rosaryTranslations[lang as keyof typeof rosaryTranslations] ?? rosaryTranslations.sk;

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

  const handleCategoryClick = (category: RosaryCategory) => {
    setSelectedCategory(category);
    setTimeout(() => {
      // Priamo na prvé tajomstvo
      router.push(`/rosary/${category}/1`);
    }, 150);
  };

  // Ikony pre kategórie
  const getCategoryIcon = (category: RosaryCategory) => {
    switch (category) {
      case 'joyful':
        return <Sun size={32} />;
      case 'luminous':
        return <Sparkles size={32} />;
      case 'sorrowful':
        return <Cross size={32} />;
      case 'glorious':
        return <Crown size={32} />;
      default:
        return <Heart size={32} />;
    }
  };

  const totalDecades = categoryStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalAudio = categoryStats.reduce((sum, stat) => sum + stat.hasAudio, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden pt-16">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/rosary-background.webp"
            alt="Ruženec pozadie"
            fill
            priority
            className="object-cover"
            quality={90}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            {/* Icon badge */}
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-2xl mb-8 text-white backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(64, 70, 123, 0.9)' }}
            >
              <Crown size={40} />
            </div>
            
            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-2xl">
              {t.heroTitle}
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed mb-8 drop-shadow-lg">
              {t.heroSubtitle}
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20">
                <BookOpen size={18} style={{ color: '#40467b' }} />
                <span className="text-sm font-medium text-gray-800">{t.fiveSteps}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20">
                <Headphones size={18} style={{ color: '#40467b' }} />
                <span className="text-sm font-medium text-gray-800">{t.audioRecordings}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20">
                <Heart size={18} style={{ color: '#40467b' }} />
                <span className="text-sm font-medium text-gray-800">{t.fourCategories}</span>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(64, 70, 123, 0.9)' }}
                >
                  <Star size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
                  {totalDecades}
                </h3>
                <p className="text-white/90 font-medium">{t.mysteries}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(104, 110, 163, 0.9)' }}
                >
                  <Headphones size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
                  {totalAudio}
                </h3>
                <p className="text-white/90 font-medium">{t.withAudio}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(144, 150, 193, 0.9)' }}
                >
                  <Clock size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
                  15-20
                </h3>
                <p className="text-white/90 font-medium">{t.minutesPerMystery}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES SECTION */}
      <div className="py-20" style={{ backgroundColor: '#40467b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              {t.selectCategory}
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {t.selectCategoryDesc}
            </p>
          </div>

          {/* Category cards - 4 v jednom radu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROSARY_CATEGORIES.map((category, index) => {
            const categoryInfo = getCategoryInfo(category);
            const stats = categoryStats.find(s => s.category === category);
            const isSelected = selectedCategory === category;
            
            // Purple gradient colors for each category
            const gradientColors = [
              { from: '#40467b', to: '#545a94' }, // joyful
              { from: '#545a94', to: '#686ea3' }, // luminous
              { from: '#686ea3', to: '#7c82b2' }, // sorrowful
              { from: '#7c82b2', to: '#9096c1' }  // glorious
            ];
            
            const gradient = gradientColors[index];
            
            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                disabled={loading}
                className={`group relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl hover:bg-white/20 transition-all duration-300 p-6 text-center overflow-hidden border border-white/20 ${
                  isSelected ? 'scale-[1.05]' : 'hover:scale-[1.05]'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-4 backdrop-blur-sm"
                    style={{
                      backgroundColor: `${gradient.from}cc`
                    }}
                  >
                    {getCategoryIcon(category)}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {categoryInfo.name}
                  </h3>
                  
                  {/* Stats */}
                  {stats && (
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center justify-center gap-2">
                        <BookOpen size={14} className="text-white/70" />
                        <span className="text-sm text-white/90">
                          {stats.count} {t.mysteriesCount}
                        </span>
                      </div>
                      
                      {stats.hasAudio > 0 && (
                        <div className="flex items-center justify-center gap-2">
                          <Headphones size={14} className="text-white/70" />
                          <span className="text-sm text-white/90">
                            {stats.hasAudio} {t.withAudioCount}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* CTA */}
                  <div className="inline-flex items-center gap-2 font-semibold text-sm text-white group-hover:gap-3 transition-all">
                    {t.start}
                    <ChevronRight size={16} />
                  </div>
                </div>
                
                {/* Loading overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                    <div 
                      className="animate-spin rounded-full h-8 w-8 border-3"
                      style={{ 
                        borderColor: `${gradient.from}30`,
                        borderTopColor: gradient.from
                      }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      {/* IMAGE & BENEFITS SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Left: Illustrative Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/rosary-img.webp"
              alt="Ruženec ilustrácia"
              fill
              className="object-cover"
              quality={95}
            />
          </div>

          {/* Right: Spiritual Benefits */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="p-3 rounded-xl text-white backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(124, 130, 178, 0.9)' }}
              >
                <Sparkles size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {t.spiritualBenefits}
              </h3>
            </div>
            
            <div className="space-y-4">
              {[
                t.benefits.deeper,
                t.benefits.peaceful,
                t.benefits.personal,
                t.benefits.growth,
                t.benefits.practical,
                t.benefits.tradition
              ].map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <CheckCircle2 size={20} style={{ color: '#7c82b2' }} className="flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 sm:p-12 mt-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#40467b' }}>
              {t.appFeatures}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t.appFeaturesDesc}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Headphones size={24} />, title: t.features.audio.title, desc: t.features.audio.desc, color: '#40467b' },
              { icon: <BookOpen size={24} />, title: t.features.biblical.title, desc: t.features.biblical.desc, color: '#545a94' },
              { icon: <Eye size={24} />, title: t.features.stepByStep.title, desc: t.features.stepByStep.desc, color: '#686ea3' },
              { icon: <Heart size={24} />, title: t.features.interactive.title, desc: t.features.interactive.desc, color: '#7c82b2' }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center hover:shadow-lg transition-all"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-white"
                  style={{ backgroundColor: feature.color }}
                >
                  {feature.icon}
                </div>
                <h4 className="font-bold mb-2" style={{ color: feature.color }}>
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-4 mb-4"
              style={{ 
                borderColor: 'rgba(64, 70, 123, 0.2)',
                borderTopColor: '#40467b'
              }}
            />
            <span className="text-lg font-semibold" style={{ color: '#40467b' }}>
              {t.loading}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
