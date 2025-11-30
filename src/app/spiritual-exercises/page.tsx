'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Locale {
  id: number;
  code: string;
  native_name: string;
}

interface Exercise {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  home_image_url: string | null;
  start_date: string;
  end_date: string;
  location_name: string;
  location_city: string | null;
  location_country: string;
  leader_name: string | null;
  max_capacity: number | null;
  locale: Locale;
}

export default function SpiritualExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [locales, setLocales] = useState<Locale[]>([]);
  const [selectedLocale, setSelectedLocale] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocales();
  }, []);

  const fetchLocales = async () => {
    try {
      const response = await fetch('/api/locales');
      if (response.ok) {
        const data = await response.json();
        setLocales(data);
      }
    } catch (error) {
      console.error('Error fetching locales:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const url = selectedLocale
        ? `/api/spiritual-exercises?locale=${selectedLocale}`
        : '/api/spiritual-exercises';
      
      const response = await fetch(url);
      if (response.ok) {
        const { exercises: data } = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocale]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: 'url(/about-background.webp)' }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(64, 70, 123, 0.8)' }} />
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Duchovné cvičenia
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto">
            Príďte a zažite čas pokoja, modlitby a duchovnej obnovy. Naše duchovné cvičenia sú priestorom 
            na stretnutie so sebou, druhými a Bohom.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <div className="bg-white/95 backdrop-blur-sm border-b sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label htmlFor="locale-filter" className="font-semibold text-gray-800">
              Filter jazyka:
            </label>
            <select
              id="locale-filter"
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm"
            >
              <option value="">Všetky jazyky</option>
              {locales.map((locale) => (
                <option key={locale.id} value={locale.code}>
                  {locale.native_name}
                </option>
              ))}
            </select>
            <div className="sm:ml-auto text-sm font-medium text-gray-600">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Načítavam...
                </span>
              ) : (
                `${exercises.length} ${exercises.length === 1 ? 'cvičenie' : exercises.length < 5 ? 'cvičenia' : 'cvičení'}`
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Načítavam duchovné cvičenia...</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="max-w-md mx-auto px-6">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-700 text-xl font-semibold mb-2">
                {selectedLocale 
                  ? 'Pre zvolený jazyk momentálne nemáme žiadne naplánované duchovné cvičenia.' 
                  : 'Momentálne nemáme žiadne naplánované duchovné cvičenia.'}
              </p>
              <p className="text-gray-500">
                Skúste vybrať iný jazyk alebo sa vráťte neskôr.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exercises.map((exercise) => (
              <Link
                key={exercise.id}
                href={`/spiritual-exercises/${exercise.slug}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  {exercise.home_image_url ? (
                    <Image
                      src={exercise.home_image_url}
                      alt={exercise.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-blue-600/90 backdrop-blur-sm rounded-full uppercase tracking-wide">
                      {exercise.locale.native_name}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {exercise.title}
                  </h2>

                  {exercise.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {exercise.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="space-y-2.5 mb-5">
                    {/* Dates */}
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 mr-2.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">
                        {formatDate(exercise.start_date)} - {formatDate(exercise.end_date)}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 mr-2.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">
                        {exercise.location_name}
                        {exercise.location_city && `, ${exercise.location_city}`}
                      </span>
                    </div>

                    {/* Leader */}
                    {exercise.leader_name && (
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">{exercise.leader_name}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-blue-600 font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                      Viac informácií
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
