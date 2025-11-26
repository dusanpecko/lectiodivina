'use client';

import RegistrationForm from '@/components/RegistrationForm';
import type {
  Locale,
  SpiritualExercise,
  SpiritualExerciseGallery,
  SpiritualExercisePricing,
  SpiritualExerciseTestimonial
} from '@/types/spiritual-exercises';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  User,
  Users
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface ExerciseDetailPageProps {
  params: Promise<{ slug: string }>;
}

interface ExerciseWithStats extends Omit<SpiritualExercise, 'pricing' | 'testimonials' | 'gallery' | 'locale'> {
  pricing: SpiritualExercisePricing[];
  testimonials: SpiritualExerciseTestimonial[];
  gallery: SpiritualExerciseGallery[];
  locale: Locale;
  current_registrations: number;
  is_full: boolean;
}

export default function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const { slug } = use(params);
  const [exercise, setExercise] = useState<ExerciseWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    fetchExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchExercise = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/spiritual-exercises/${slug}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Nepodarilo sa načítať duchovné cvičenie');
      }

      const { exercise: data } = await response.json();
      setExercise(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const nextImage = () => {
    if (exercise?.gallery) {
      setCurrentGalleryIndex((prev) => 
        prev === exercise.gallery.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (exercise?.gallery) {
      setCurrentGalleryIndex((prev) => 
        prev === 0 ? exercise.gallery.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-6 text-gray-700 text-lg font-medium">Načítavam...</p>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <svg className="w-20 h-20 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Duchovné cvičenie sa nenašlo'}
          </h1>
          <Link 
            href="/spiritual-exercises"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Späť na zoznam
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {exercise.image_url ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${exercise.image_url})` }}
            />
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(64, 70, 123, 0.75)' }} />
          </>
        ) : (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
              style={{ backgroundImage: 'url(/about-background.webp)' }}
            />
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(64, 70, 123, 0.8)' }} />
          </>
        )}
        
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <Link 
            href="/spiritual-exercises"
            className="inline-flex items-center text-white/90 hover:text-white mb-8 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Späť na zoznam
          </Link>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight max-w-4xl">
            {exercise.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm sm:text-base">
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Calendar className="w-5 h-5 mr-2.5 flex-shrink-0" />
              <span className="font-medium">{formatDateShort(exercise.start_date)} - {formatDateShort(exercise.end_date)}</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <MapPin className="w-5 h-5 mr-2.5 flex-shrink-0" />
              <span className="font-medium">{exercise.location_name}, {exercise.location_city}</span>
            </div>
            {exercise.leader_name && (
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <User className="w-5 h-5 mr-2.5 flex-shrink-0" />
                <span className="font-medium">{exercise.leader_name}</span>
              </div>
            )}
            {exercise.max_capacity && (
              <div className={`flex items-center backdrop-blur-sm px-4 py-2 rounded-lg ${
                exercise.is_full ? 'bg-red-500/20' : 'bg-white/10'
              }`}>
                <Users className="w-5 h-5 mr-2.5 flex-shrink-0" />
                <span className="font-medium">
                  {exercise.current_registrations} / {exercise.max_capacity} miest
                  {exercise.is_full && <span className="ml-2 text-red-300 font-bold">(Plne obsadené)</span>}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Description & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {exercise.description && (
              <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">O cvičení</h2>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {exercise.description}
                </p>
              </section>
            )}

            {/* Full Description */}
            {exercise.full_description && (
              <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Podrobný popis</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <div dangerouslySetInnerHTML={{ __html: exercise.full_description }} />
                </div>
              </section>
            )}

            {/* Leader Bio */}
            {exercise.leader_name && exercise.leader_bio && (
              <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Lektor</h2>
                <div className="flex items-start gap-6">
                  {exercise.leader_photo && (
                    <div className="relative w-28 h-28 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-blue-100">
                      <Image
                        src={exercise.leader_photo}
                        alt={exercise.leader_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {exercise.leader_name}
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                      {exercise.leader_bio}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Gallery */}
            {exercise.gallery && exercise.gallery.length > 0 && (
              <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Galéria</h2>
                <div className="relative">
                  <div className="relative h-96 bg-gray-200 rounded-xl overflow-hidden">
                    <Image
                      src={exercise.gallery[currentGalleryIndex].image_url}
                      alt={exercise.gallery[currentGalleryIndex].alt_text || `Obrázok ${currentGalleryIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {exercise.gallery.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                        aria-label="Predchádzajúci obrázok"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                        aria-label="Ďalší obrázok"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-800" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentGalleryIndex + 1} / {exercise.gallery.length}
                      </div>
                    </>
                  )}
                  
                  {exercise.gallery[currentGalleryIndex].caption && (
                    <p className="mt-4 text-gray-600 text-center italic">
                      {exercise.gallery[currentGalleryIndex].caption}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Testimonials */}
            {exercise.testimonials && exercise.testimonials.length > 0 && (
              <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Ohlasy účastníkov</h2>
                <div className="space-y-6">
                  {exercise.testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border-l-4 border-blue-600 pl-6 py-3 bg-blue-50/30 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {testimonial.author_name}
                        </span>
                        {testimonial.rating && (
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating!
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 text-lg italic leading-relaxed">
                        &ldquo;{testimonial.testimonial_text}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Pricing Card */}
              {exercise.pricing && exercise.pricing.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-5">Cenník</h3>
                  <div className="space-y-3">
                    {exercise.pricing.map((price) => (
                      <div key={price.id} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 text-lg">{price.room_type}</div>
                            {price.description && (
                              <div className="text-sm text-gray-700 mt-1.5">{price.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-blue-200/50">
                          <div className="text-sm text-gray-600">
                            <div>Cena za izbu: <span className="font-semibold">{price.price.toFixed(2)} €</span></div>
                            <div>Záloha: <span className="font-semibold">{(price.deposit || 50).toFixed(2)} €</span></div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Celkom</div>
                            <div className="text-xl font-bold text-blue-700">
                              {(price.price + (price.deposit || 50)).toFixed(2)} €
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Miesto konania</h3>
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold text-lg">{exercise.location_name}</p>
                  {exercise.location_address && <p className="text-gray-600">{exercise.location_address}</p>}
                  {exercise.location_city && (
                    <p className="text-gray-600">{exercise.location_city}, {exercise.location_country}</p>
                  )}
                </div>
              </div>

              {/* Dates Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Termín</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium mb-1">Začiatok</p>
                    <p className="font-bold text-lg text-gray-900">{formatDate(exercise.start_date)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium mb-1">Koniec</p>
                    <p className="font-bold text-lg text-gray-900">{formatDate(exercise.end_date)}</p>
                  </div>
                </div>
              </div>

              {/* Registration Button */}
              {!showRegistrationForm && (
                <button
                  onClick={() => setShowRegistrationForm(true)}
                  disabled={exercise.is_full}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg transform hover:scale-105 ${
                    exercise.is_full
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                  }`}
                >
                  {exercise.is_full ? 'Plne obsadené' : 'Prihlásiť sa'}
                </button>
              )}

              {exercise.is_full && !showRegistrationForm && (
                <p className="text-sm text-gray-600 text-center px-4 py-3 bg-red-50 rounded-lg border border-red-200">
                  Kapacita cvičenia je naplnená. Pre viac informácií nás kontaktujte.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Section */}
      {showRegistrationForm && !registrationSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Registračný formulár</h2>
              <p className="text-gray-600">{exercise.title}</p>
            </div>
            
            <RegistrationForm
              exerciseSlug={slug}
              exerciseTitle={exercise.title}
              pricing={exercise.pricing}
              onSuccess={() => {
                setRegistrationSuccess(true);
                setShowRegistrationForm(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onCancel={() => {
                setShowRegistrationForm(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      )}

      {/* Registration Success Modal */}
      {registrationSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Registrácia bola odoslaná!</h3>
              <p className="text-gray-600 mb-6">
                Ďakujeme za vašu registráciu. Na uvedený email sme vám poslali potvrdenie s platobným údajmi a ďalšími informáciami.
              </p>
              <button
                onClick={() => setRegistrationSuccess(false)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Zavrieť
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
