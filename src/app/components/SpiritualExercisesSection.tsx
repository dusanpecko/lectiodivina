"use client";
import type { SpiritualExercise, SpiritualExercisePricing } from "@/types/spiritual-exercises";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Language } from "./LanguageProvider";

interface SpiritualExerciseSectionProps {
  lang: Language;
}

interface ExerciseWithPricing extends SpiritualExercise {
  pricing: SpiritualExercisePricing[];
}

export default function SpiritualExercisesSection({ lang }: SpiritualExerciseSectionProps) {
  const [exercises, setExercises] = useState<ExerciseWithPricing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const slideVariants = {
    enter: { opacity: 0, scale: 0.98 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 }
  };

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchExercises() {
      try {
        const response = await fetch(`/api/spiritual-exercises?locale=${lang}&status=published`);
        if (response.ok) {
          const data = await response.json();
          setExercises(data.exercises || []);
        }
      } catch (error) {
        console.error("Error fetching spiritual exercises:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchExercises();
  }, [lang]);

  const hasMultiple = exercises.length > 1;

  // Autoplay timer
  useEffect(() => {
    if (loading || !hasMultiple || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % exercises.length);
    }, 8000); // Change slide every 8 seconds

    return () => clearInterval(timer);
  }, [currentIndex, exercises.length, isPaused, loading, hasMultiple]);

  if (loading || exercises.length === 0) {
    return null; // Don't show section if no exercises
  }

  const currentExercise = exercises[currentIndex];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'sk' ? 'sk-SK' : lang === 'cz' ? 'cs-CZ' : lang === 'en' ? 'en-US' : 'es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getMinPrice = () => {
    if (!currentExercise.pricing || currentExercise.pricing.length === 0) return null;
    const prices = currentExercise.pricing.map(p => p.price + (p.deposit || 50));
    return Math.min(...prices);
  };

  const translations = {
    sk: {
      title: "Duchovné cvičenia",
      subtitle: "Ponorte sa do hlbšieho duchovného zážitku",
      location: "Miesto konania",
      date: "Termín",
      from: "od",
      capacity: "Kapacita",
      places: "miest",
      learnMore: "Zistiť viac",
      register: "Registrovať sa",
    },
    cz: {
      title: "Duchovní cvičení",
      subtitle: "Ponořte se do hlubšího duchovního zážitku",
      location: "Místo konání",
      date: "Termín",
      from: "od",
      capacity: "Kapacita",
      places: "míst",
      learnMore: "Zjistit více",
      register: "Registrovat se",
    },
    en: {
      title: "Spiritual Exercises",
      subtitle: "Immerse yourself in a deeper spiritual experience",
      location: "Location",
      date: "Date",
      from: "from",
      capacity: "Capacity",
      places: "places",
      learnMore: "Learn more",
      register: "Register",
    },
    es: {
      title: "Ejercicios Espirituales",
      subtitle: "Sumérgete en una experiencia espiritual más profunda",
      location: "Ubicación",
      date: "Fecha",
      from: "desde",
      capacity: "Capacidad",
      places: "plazas",
      learnMore: "Saber más",
      register: "Registrarse",
    },
  };

  const t = translations[lang];
  const minPrice = getMinPrice();

  return (
    <section 
      className="relative min-h-screen py-12 sm:py-16 w-full flex items-center justify-center overflow-hidden snap-start"
      style={{ backgroundColor: 'rgb(248, 249, 250)' }}
    >
      {/* Decorative blur elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#686ea3]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#40467b]/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 lg:mb-10"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#40467b' }}>
            {t.title}
          </h2>
          <p className="text-lg text-gray-600">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Content Grid */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div 
            key={currentIndex}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.6,
              ease: [0.4, 0.0, 0.2, 1]
            }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          >
          {/* Left Column - Text Content */}
          <div className="text-gray-900 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold" style={{ color: '#40467b' }}>
              {currentExercise.title}
            </h3>

            {currentExercise.description && (
              <div 
                className="text-gray-700 prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: currentExercise.description }}
              />
            )}

            {/* Info Cards */}
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-[#686ea3]" />
                <div>
                  <div className="font-semibold text-sm text-gray-600">{t.location}</div>
                  <div className="text-lg">
                    {currentExercise.location_name}
                    {currentExercise.location_city && `, ${currentExercise.location_city}`}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <svg className="w-5 h-5 mt-1 flex-shrink-0 text-[#686ea3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="font-semibold text-sm text-gray-600">{t.date}</div>
                  <div className="text-lg">
                    {formatDate(currentExercise.start_date)} - {formatDate(currentExercise.end_date)}
                  </div>
                </div>
              </div>

              {currentExercise.max_capacity && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <svg className="w-5 h-5 mt-1 flex-shrink-0 text-[#686ea3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-sm text-gray-600">{t.capacity}</div>
                    <div className="text-lg">{currentExercise.max_capacity} {t.places}</div>
                  </div>
                </div>
              )}

              {minPrice && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <svg className="w-5 h-5 mt-1 flex-shrink-0 text-[#686ea3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-sm text-gray-600">Cena</div>
                    <div className="text-lg">{t.from} {minPrice.toFixed(2)} €</div>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={() => router.push(`/spiritual-exercises/${currentExercise.slug}`)}
                className="px-8 py-3 bg-[#40467b] text-white rounded-lg font-semibold hover:bg-[#40467b]/90 transition-all transform hover:scale-105 shadow-lg"
              >
                {t.learnMore}
              </button>
            </div>
          </div>

          {/* Right Column - Image with Testimonials Overlay */}
          <div className="relative">
            {currentExercise.image_url ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-full">
                <Image
                  src={currentExercise.image_url}
                  alt={currentExercise.title}
                  width={800}
                  height={500}
                  className="w-full h-[350px] sm:h-[400px] lg:h-[450px] object-cover"
                />
                
                {/* Testimonials Overlay - if available */}
                {currentExercise.testimonials && currentExercise.testimonials.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                    <div className="text-white">
                      <p className="text-sm italic mb-2">
                        &ldquo;{currentExercise.testimonials[0].testimonial_text.substring(0, 120)}...&rdquo;
                      </p>
                      <p className="text-xs font-semibold">
                        - {currentExercise.testimonials[0].author_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-2xl h-[350px] sm:h-[400px] lg:h-[450px] flex items-center justify-center border border-gray-200">
                <span className="text-gray-400 text-6xl">🙏</span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

        {/* Dots Indicator - Show only if multiple exercises */}
        {hasMultiple && (
          <div 
            className="flex justify-center gap-2 mt-8"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {exercises.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-[#686ea3] w-8' : 'bg-gray-300 w-2'
                }`}
                aria-label={`Go to exercise ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
