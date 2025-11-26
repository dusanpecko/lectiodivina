'use client';

import { Locale, SpiritualExercise } from '@/types/spiritual-exercises';
import { Calendar, Heart, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export default function AdminSpiritualExercisesPage() {
  const [exercises, setExercises] = useState<SpiritualExercise[]>([]);
  const [locales, setLocales] = useState<Locale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocale, setSelectedLocale] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedLocale === 'all' 
        ? '/api/admin/spiritual-exercises'
        : `/api/admin/spiritual-exercises?locale=${selectedLocale}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLocale]);

  const fetchLocales = useCallback(async () => {
    try {
      const response = await fetch('/api/locales');
      if (response.ok) {
        const data = await response.json();
        setLocales(data);
      }
    } catch (error) {
      console.error('Error fetching locales:', error);
    }
  }, []);

  useEffect(() => {
    fetchLocales();
    fetchExercises();
  }, [fetchExercises, fetchLocales]);

  const handleDelete = (id: number) => {
    setExerciseToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!exerciseToDelete) return;

    try {
      const response = await fetch(`/api/admin/spiritual-exercises/${exerciseToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setExerciseToDelete(null);
        fetchExercises();
      } else {
        alert('Chyba pri mazaní cvičenia');
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Chyba pri mazaní cvičenia');
    }
  };

  const togglePublished = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/spiritual-exercises/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentStatus }),
      });

      if (response.ok) {
        fetchExercises();
      }
    } catch (error) {
      console.error('Error toggling published status:', error);
    }
  };

  const handleDuplicate = async (id: number) => {
    if (!confirm('Naozaj chcete duplikovať toto cvičenie?')) return;

    try {
      const response = await fetch(`/api/admin/spiritual-exercises/${id}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        await response.json();
        alert('Cvičenie bolo úspešne duplikované');
        fetchExercises();
        // Optionally redirect to edit the new exercise
        // window.location.href = `/admin/spiritual-exercises/${data.exercise.id}`;
      } else {
        alert('Chyba pri duplikovaní cvičenia');
      }
    } catch (error) {
      console.error('Error duplicating exercise:', error);
      alert('Chyba pri duplikovaní cvičenia');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p>Načítavam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <Heart size={28} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                      Duchovné cvičenia
                    </h1>
                    <p className="text-indigo-100 mt-1">Správa duchovných cvičení a registrácií</p>
                  </div>
                </div>
                <Link
                  href="/admin/spiritual-exercises/new"
                  className="bg-white text-[#40467b] px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  + Nové cvičenie
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{exercises.length}</div>
                  <div className="text-sm text-indigo-100 mt-1">Celkom cvičení</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">
                    {exercises.filter(e => e.is_published).length}
                  </div>
                  <div className="text-sm text-indigo-100 mt-1">Publikované</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">
                    {exercises.reduce((sum, e) => sum + (e.current_registrations || 0), 0)}
                  </div>
                  <div className="text-sm text-indigo-100 mt-1">Registrácií</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">
                    {exercises.filter(e => 
                      e.max_capacity && e.current_registrations >= e.max_capacity
                    ).length}
                  </div>
                  <div className="text-sm text-indigo-100 mt-1">Plne obsadené</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 rounded-xl p-6 mx-6 -mt-4 mb-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700">Jazyk:</label>
                <select
                  value={selectedLocale}
                  onChange={(e) => setSelectedLocale(e.target.value)}
                  className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition-colors"
                >
                  <option value="all">Všetky jazyky</option>
                  {locales.map((locale) => (
                    <option key={locale.id} value={locale.code}>
                      {locale.native_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {exercises.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-700">Žiadne duchovné cvičenia</p>
              <p className="text-sm mt-2">Vytvorte prvé cvičenie kliknutím na tlačidlo vyššie</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Názov
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Termín
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Miesto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Jazyk
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kapacita
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Akcie
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exercises.map((exercise) => (
                    <tr key={exercise.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {exercise.image_url ? (
                            <Image
                              src={exercise.image_url}
                              alt={exercise.title}
                              width={56}
                              height={56}
                              className="h-14 w-14 rounded-lg object-cover mr-4 shadow-sm"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 mr-4 flex items-center justify-center shadow-sm">
                              <Heart size={24} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {exercise.title}
                            </div>
                            {exercise.leader_name && (
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Users size={14} />
                                {exercise.leader_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-900">
                          <Calendar size={14} className="text-gray-400" />
                          <div>
                            <div>{formatDate(exercise.start_date)}</div>
                            <div className="text-gray-500">
                              {formatDate(exercise.end_date)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-1.5">
                          <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="text-gray-900 font-medium">
                              {exercise.location_name}
                            </div>
                            {exercise.location_city && (
                              <div className="text-gray-500">
                                {exercise.location_city}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {exercise.locale?.native_name || exercise.locale_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-gray-400" />
                          <span className={`text-sm font-semibold ${
                            exercise.max_capacity && exercise.current_registrations >= exercise.max_capacity
                              ? 'text-red-600' 
                              : 'text-gray-900'
                          }`}>
                            {exercise.current_registrations}
                            {exercise.max_capacity && ` / ${exercise.max_capacity}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePublished(exercise.id, exercise.is_published)}
                          className={`px-3 py-1.5 inline-flex items-center text-xs font-semibold rounded-lg transition-all ${
                            exercise.is_published
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {exercise.is_published ? '✓ Publikované' : 'Koncept'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/spiritual-exercises/${exercise.id}`}
                          className="text-[#40467b] hover:text-[#686ea3] font-semibold mr-4 transition-colors"
                        >
                          Upraviť
                        </Link>
                        <button
                          onClick={() => handleDuplicate(exercise.id)}
                          className="text-blue-600 hover:text-blue-800 font-semibold mr-4 transition-colors"
                        >
                          Duplikovať
                        </button>
                        <button
                          onClick={() => handleDelete(exercise.id)}
                          className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                        >
                          Vymazať
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Vymazať cvičenie
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Naozaj chcete vymazať toto duchovné cvičenie? Táto akcia sa nedá vrátiť späť.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setExerciseToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Vymazať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
