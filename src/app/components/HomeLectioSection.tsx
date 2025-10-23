// HomeLectioSection.tsx - Preview dnešného Lectio Divina na homepage
"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { homeLectioTranslations } from "@/app/components/homeLectioTranslations";
import { motion } from "framer-motion";
import { Book, BookOpen, Brain, Calendar, ChevronRight, Heart, Lock, LockOpen, Target, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LiturgicalDay {
  date: string;
  season: string;
  celebration_title: string;
  celebration_rank: string;
  celebration_colour: string;
}

interface LectioData {
  id: number;
  hlava: string;
  suradnice_pismo: string;
  kniha: string;
  kapitola: string;
  nazov_biblia_1: string;
  biblia_1: string;
  biblia_1_audio: string | null;
  lectio_preview: string | null;
  has_meditatio: boolean;
  has_oratio: boolean;
  has_contemplatio: boolean;
  has_actio: boolean;
  has_audio: boolean;
}

interface TodayLectioResponse {
  liturgicalDay: LiturgicalDay;
  lectio: LectioData | null;
}

export default function HomeLectioSection() {
  const { lang } = useLanguage();
  const { session } = useSupabase();
  const router = useRouter();
  const t = homeLectioTranslations[lang];
  
  const [data, setData] = useState<TodayLectioResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayLectio = async () => {
      try {
        const response = await fetch(`/api/lectio/today?lang=${lang}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching today lectio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayLectio();
  }, [lang]);

  const handleCTAClick = () => {
    if (session) {
      router.push('/lectio');
    } else {
      router.push('/login?redirect=/lectio');
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen py-20 sm:py-32 flex items-center justify-center snap-start" style={{ backgroundColor: '#40467b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <div className="animate-pulse flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-4">
              <div className="h-10 w-80 bg-white/20 rounded-lg"></div>
              <div className="h-32 bg-white/10 rounded-xl"></div>
            </div>
            <div className="flex-1">
              <div className="h-96 bg-white/10 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!data?.lectio) {
    return null;
  }

  const { liturgicalDay, lectio } = data;

  return (
    <section className="h-screen py-20 sm:py-32 relative overflow-hidden flex items-center justify-center snap-start" style={{ backgroundColor: '#40467b' }}>
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 w-full">
        
        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column - Info & CTA */}
          <motion.div
            className="flex-1 text-white"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/90 font-bold text-sm px-4 py-2 rounded-full mb-6" style={{ color: '#40467b' }}>
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(liturgicalDay.date).toLocaleDateString(
                  lang === 'sk' ? 'sk-SK' : lang === 'cz' ? 'cs-CZ' : lang === 'en' ? 'en-US' : 'es-ES',
                  { day: 'numeric', month: 'long', year: 'numeric' }
                )}
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight flex items-center gap-3">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12" />
              <span>{t.title}</span>
            </h2>
            
            <p className="text-xl text-white/90 mb-8">
              {liturgicalDay.celebration_title}
            </p>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen size={24} className="text-white/80" />
                <h3 className="text-2xl font-bold">{lectio.hlava}</h3>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <span className="font-medium">{lectio.suradnice_pismo}</span>
                <span>•</span>
                <span>{lectio.kniha} {lectio.kapitola}</span>
              </div>
            </div>

            {/* Locked Sections Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
              {[
                { label: t.locked_sections.lectio, icon: Book, has: true },
                { label: t.locked_sections.meditatio, icon: Brain, has: lectio.has_meditatio },
                { label: t.locked_sections.oratio, icon: Heart, has: lectio.has_oratio },
                { label: t.locked_sections.contemplatio, icon: Target, has: lectio.has_contemplatio },
              ].map((section) => {
                const Icon = section.icon;
                return (
                <div
                  key={section.label}
                  className={`relative rounded-xl p-4 text-center transition-all ${
                    section.has
                      ? 'bg-white/15 border-2 border-white/30'
                      : 'bg-white/5 border-2 border-white/10 opacity-60'
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-lg p-1.5 mb-2 mx-auto"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                  >
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <div className="text-sm font-semibold text-white">{section.label}</div>
                  {section.has && (
                    <div className="absolute top-2 right-2">
                      <Lock size={14} className="text-white/50" />
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <button
                onClick={handleCTAClick}
                className="group w-full inline-flex items-center justify-center gap-3 bg-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                style={{ color: '#40467b' }}
              >
                {session ? (
                  <>
                    <span>{t.cta_button_logged_in}</span>
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" size={24} />
                  </>
                ) : (
                  <>
                    <span>{t.cta_button_logged_out}</span>
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" size={24} />
                  </>
                )}
              </button>
              
              {!session && (
                <p className="text-white/70 text-xs text-center">
                  {t.benefits}
                </p>
              )}
            </div>
          </motion.div>

          {/* Right Column - Content Preview */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div 
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="p-6 sm:p-8">
                {/* Biblický text */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <Book size={20} className="text-white/90" />
                      <span>{lectio.nazov_biblia_1}</span>
                    </h4>
                    {lectio.biblia_1_audio && (
                      <div 
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
                        title={t.audio_available}
                      >
                        <Volume2 size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-white/95 leading-relaxed bg-white/10 rounded-xl p-4 text-sm sm:text-base line-clamp-6">
                    <p className="whitespace-pre-wrap">{lectio.biblia_1}</p>
                  </div>
                </div>

                {/* Lectio Preview with Blur */}
                {lectio.lectio_preview && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <Book size={20} className="text-white/90" />
                        <span>{t.lectio_label}</span>
                      </h4>
                      <button
                        onClick={handleCTAClick}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/40 transition-all duration-200 cursor-pointer group shadow-lg"
                        title={session ? t.lock_tooltip_logged_in : t.lock_tooltip_logged_out}
                      >
                        {session ? (
                          <LockOpen size={20} className="text-white group-hover:scale-110 transition-transform" />
                        ) : (
                          <Lock size={20} className="text-white group-hover:scale-110 transition-transform" />
                        )}
                      </button>
                    </div>
                    <div className="relative overflow-hidden rounded-xl">
                      <div className="text-white/90 leading-relaxed bg-white/5 p-4 text-sm sm:text-base line-clamp-3">
                        <p>{lectio.lectio_preview}</p>
                      </div>
                      {/* Blur gradient overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/5 via-white/3 to-transparent pointer-events-none"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div> {/* Close flex container */}

      </div> {/* Close max-w container */}
    </section>
  );
}
