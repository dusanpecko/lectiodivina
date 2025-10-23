"use client";
import { Target } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Translations } from "../i18n";
import { useLanguage } from "./LanguageProvider";

type ActioData = {
  actio_text: string;
  reference: string;
};

type DailyQuoteProps = {
  t: Translations['sk']; // Type for one language from translations
  router: AppRouterInstance;
};

export default function DailyQuote({ t: tProp, router }: DailyQuoteProps) {
  const { lang, isLoaded } = useLanguage();
  const [actio, setActio] = useState<ActioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Use passed translations
  const t = tProp;

  // Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch actio from today's lectio
  useEffect(() => {
    if (!mounted || !isLoaded) return;

    async function fetchActio() {
      setLoading(true);
      
      try {
        // Fetch from API endpoint (same as HomeLectioSection)
        const response = await fetch(`/api/lectio/today?lang=${lang}`);
        if (response.ok) {
          const result = await response.json();
          if (result?.lectio?.actio_text) {
            setActio({
              actio_text: result.lectio.actio_text,
              reference: result.lectio.reference || result.liturgicalDay.celebration_title || ''
            });
          } else {
            setActio(null);
          }
        } else {
          setActio(null);
        }
      } catch (error) {
        console.error('Error fetching actio:', error);
        setActio(null);
      } finally {
        setLoading(false);
      }
    }

    fetchActio();
  }, [lang, mounted, isLoaded]);

  // Minimal loading state
  if (!mounted || !isLoaded || loading) {
    return (
      <div className="w-full flex items-center justify-center py-6">
        <div className="w-full max-w-2xl px-6 py-4 rounded-2xl bg-white/70 border border-white/40 shadow text-center">
          <span className="text-lg font-semibold text-gray-500">{t.dailyQuote.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen py-12 lg:py-16 flex items-center justify-center snap-start" style={{ background: '#f8f9fa' }}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 w-full">
        {/* Meet Your Hosts Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3" style={{ color: '#40467b' }}>
            {t.meet_your_hosts}
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {t.hosts_description}
          </p>
        </div>

        {/* Team Photos - Wave Pattern */}
        <div className="flex justify-center items-center mb-6 overflow-visible px-4">
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-0 sm:space-x-[-20px]">
            {[1, 2, 3, 4, 5].map((i, index) => (
              <div
                key={i}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-3 sm:border-4 border-white shadow-lg transition-transform hover:scale-110 hover:z-10 ${index % 2 === 0 ? 'sm:translate-y-[-8px]' : 'sm:translate-y-[8px]'}`}
              >
                <Image 
                  src={`/profile_${i}.webp`}
                  alt={`Team member ${i}`}
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to gradient if image not found
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.style.background = `linear-gradient(135deg, ${index % 3 === 0 ? '#40467b' : index % 3 === 1 ? '#686ea3' : '#9ca3af'} 0%, rgba(255,255,255,0.2) 100%)`;
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full h-full flex items-center justify-center text-white text-3xl font-bold';
                      fallback.textContent = String.fromCharCode(64 + i);
                      target.parentElement.appendChild(fallback);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Discover Button */}
        <div className="text-center mb-10">
          <button
            onClick={() => router.push('/about')}
            className="px-6 py-3 rounded-xl text-white font-semibold text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
            style={{ background: '#40467b' }}
          >
            {t.discover_more}
          </button>
        </div>

        {/* Daily Actio Card */}
        <div className="w-full flex items-center justify-center">
          <div
            className="w-full max-w-4xl rounded-2xl shadow-lg p-6 lg:p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3" style={{ background: 'rgba(64, 70, 123, 0.15)' }}>
                <Target className="w-7 h-7" style={{ color: '#40467b' }} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#40467b' }}>
                {t.daily_actio}
              </h3>
            </div>

            <div className="max-w-2xl mx-auto">
              {actio ? (
                <>
                  <blockquote className="mb-4">
                    <p className="text-lg sm:text-xl font-semibold leading-relaxed text-gray-700 text-center">
                      &ldquo;{actio.actio_text}&rdquo;
                    </p>
                  </blockquote>
                  <cite className="block text-center text-sm text-gray-500 italic">
                    — {actio.reference}
                  </cite>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-lg text-gray-600">
                    {t.dailyQuote?.no_quote_today}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {t.dailyQuote?.check_back_tomorrow}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}