'use client';

import ImageUploadCrop from '@/app/components/ImageUploadCrop';
import SimpleRichTextEditor from '@/app/components/SimpleRichTextEditor';
import { createClient } from '@/app/lib/supabase/client';
import {
  Locale,
  PaymentStatus,
  SpiritualExercise,
  SpiritualExerciseGallery,
  SpiritualExercisePricing,
  SpiritualExerciseRegistration,
  SpiritualExerciseTestimonial,
} from '@/types/spiritual-exercises';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type Tab = 'basic' | 'pricing' | 'testimonials' | 'gallery' | 'registrations';

export default function EditSpiritualExercisePage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params?.id as string;
  const isNew = exerciseId === 'new';
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [exercise, setExercise] = useState<SpiritualExercise | null>(null);
  const [locales, setLocales] = useState<Locale[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Basic info form
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    full_description: '',
    image_url: '',
    home_image_url: '',
    start_date: '',
    end_date: '',
    location_name: '',
    location_address: '',
    location_city: '',
    location_country: 'Slovakia',
    locale_id: '',
    leader_name: '',
    leader_bio: '',
    leader_photo: '',
    max_capacity: '',
    is_published: false,
  });

  // Nested resources
  const [pricing, setPricing] = useState<SpiritualExercisePricing[]>([]);
  const [testimonials, setTestimonials] = useState<SpiritualExerciseTestimonial[]>([]);
  const [gallery, setGallery] = useState<SpiritualExerciseGallery[]>([]);
  const [registrations, setRegistrations] = useState<SpiritualExerciseRegistration[]>([]);
  const [registrationStats, setRegistrationStats] = useState({
    total: 0,
    pending: 0,
    deposit_paid: 0,
    fully_paid: 0,
    cancelled: 0,
  });

  // Modals
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SpiritualExercisePricing | SpiritualExerciseTestimonial | SpiritualExerciseGallery | SpiritualExerciseRegistration | null>(null);

  const fetchExercise = useCallback(async () => {
    if (isNew) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/spiritual-exercises/${exerciseId}`);
      if (response.ok) {
        const { exercise } = await response.json();
        setExercise(exercise);
        
        // Populate form with existing data
        setFormData({
          title: exercise.title || '',
          slug: exercise.slug || '',
          description: exercise.description || '',
          full_description: exercise.full_description || '',
          image_url: exercise.image_url || '',
          home_image_url: exercise.home_image_url || '',
          start_date: exercise.start_date ? new Date(exercise.start_date).toISOString().slice(0, 16) : '',
          end_date: exercise.end_date ? new Date(exercise.end_date).toISOString().slice(0, 16) : '',
          location_name: exercise.location_name || '',
          location_address: exercise.location_address || '',
          location_city: exercise.location_city || '',
          location_country: exercise.location_country || 'Slovakia',
          locale_id: String(exercise.locale_id) || '',
          leader_name: exercise.leader_name || '',
          leader_bio: exercise.leader_bio || '',
          leader_photo: exercise.leader_photo || '',
          max_capacity: exercise.max_capacity ? String(exercise.max_capacity) : '',
          is_published: exercise.is_published || false,
        });

        setPricing(exercise.pricing || []);
        setTestimonials(exercise.testimonials || []);
        setGallery(exercise.gallery || []);
      }
    } catch (error) {
      console.error('Error fetching exercise:', error);
    } finally {
      setLoading(false);
    }
  }, [exerciseId, isNew]);

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

  const fetchRegistrations = useCallback(async () => {
    if (isNew) return;

    try {
      const response = await fetch(`/api/admin/spiritual-exercises/${exerciseId}/registrations`);
      if (response.ok) {
        const { registrations: data, stats } = await response.json();
        setRegistrations(data);
        setRegistrationStats(stats);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  }, [exerciseId, isNew]);

  useEffect(() => {
    fetchExercise();
    fetchLocales();
    fetchRegistrations();
  }, [fetchExercise, fetchLocales, fetchRegistrations]);

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        locale_id: parseInt(formData.locale_id),
        max_capacity: formData.max_capacity ? parseInt(formData.max_capacity) : null,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      if (isNew) {
        // Create new exercise
        const response = await fetch('/api/admin/spiritual-exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const { exercise } = await response.json();
          alert('Cvičenie bolo úspešne vytvorené');
          router.push(`/admin/spiritual-exercises/${exercise.id}`);
        } else {
          const error = await response.json();
          alert(`Chyba: ${error.error || 'Nepodarilo sa vytvoriť cvičenie'}`);
        }
      } else {
        // Update existing exercise
        const response = await fetch(`/api/admin/spiritual-exercises/${exerciseId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          alert('Cvičenie bolo úspešne aktualizované');
          fetchExercise();
        } else {
          const error = await response.json();
          alert(`Chyba: ${error.error || 'Nepodarilo sa aktualizovať cvičenie'}`);
        }
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert('Chyba pri ukladaní cvičenia');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Pricing handlers
  const handleSavePricing = async (data: Partial<SpiritualExercisePricing>) => {
    try {
      const url = editingItem
        ? `/api/admin/spiritual-exercises/${exerciseId}/pricing/${editingItem.id}`
        : `/api/admin/spiritual-exercises/${exerciseId}/pricing`;
      
      const method = editingItem ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchExercise();
        setShowPricingModal(false);
        setEditingItem(null);
      } else {
        alert('Chyba pri ukladaní ceny');
      }
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Chyba pri ukladaní ceny');
    }
  };

  const handleDeletePricing = async (id: number) => {
    if (!confirm('Naozaj chcete vymazať túto cenu?')) return;

    try {
      const response = await fetch(`/api/admin/spiritual-exercises/${exerciseId}/pricing/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchExercise();
      } else {
        alert('Chyba pri mazaní ceny');
      }
    } catch (error) {
      console.error('Error deleting pricing:', error);
      alert('Chyba pri mazaní ceny');
    }
  };

  // Testimonial handlers
  const handleSaveTestimonial = async (data: Partial<SpiritualExerciseTestimonial>) => {
    try {
      const url = editingItem
        ? `/api/admin/spiritual-exercises/${exerciseId}/testimonials/${editingItem.id}`
        : `/api/admin/spiritual-exercises/${exerciseId}/testimonials`;
      
      const method = editingItem ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchExercise();
        setShowTestimonialModal(false);
        setEditingItem(null);
      } else {
        alert('Chyba pri ukladaní hodnotenia');
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Chyba pri ukladaní hodnotenia');
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm('Naozaj chcete vymazať toto hodnotenie?')) return;

    try {
      const response = await fetch(`/api/admin/spiritual-exercises/${exerciseId}/testimonials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchExercise();
      } else {
        alert('Chyba pri mazaní hodnotenia');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Chyba pri mazaní hodnotenia');
    }
  };

  // Gallery handlers
  const handleSaveGallery = async (data: Partial<SpiritualExerciseGallery>) => {
    try {
      const url = editingItem
        ? `/api/admin/spiritual-exercises/${exerciseId}/gallery/${editingItem.id}`
        : `/api/admin/spiritual-exercises/${exerciseId}/gallery`;
      
      const method = editingItem ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchExercise();
        setShowGalleryModal(false);
        setEditingItem(null);
      } else {
        alert('Chyba pri ukladaní fotky');
      }
    } catch (error) {
      console.error('Error saving gallery:', error);
      alert('Chyba pri ukladaní fotky');
    }
  };

  const handleDeleteGallery = async (id: number) => {
    if (!confirm('Naozaj chcete vymazať túto fotku?')) return;

    try {
      const response = await fetch(`/api/admin/spiritual-exercises/${exerciseId}/gallery/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchExercise();
      } else {
        alert('Chyba pri mazaní fotky');
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
      alert('Chyba pri mazaní fotky');
    }
  };

  // Registration handlers
  const handleUpdateRegistrationStatus = async (registrationId: number, status: PaymentStatus) => {
    try {
      const response = await fetch(`/api/admin/spiritual-exercises/${exerciseId}/registrations/${registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: status }),
      });

      if (response.ok) {
        fetchRegistrations();
      } else {
        alert('Chyba pri aktualizácii statusu');
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      alert('Chyba pri aktualizácii statusu');
    }
  };

  const handleDeleteRegistration = async (id: number) => {
    if (!confirm('Naozaj chcete vymazať túto registráciu?')) return;

    try {
      const response = await fetch(`/api/admin/spiritual-exercises/${exerciseId}/registrations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRegistrations();
      } else {
        alert('Chyba pri mazaní registrácie');
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Chyba pri mazaní registrácie');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-gray-600">Načítavam...</div>
      </div>
    );
  }

  if (!exercise && !isNew) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-red-600">Cvičenie sa nenašlo</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/admin/spiritual-exercises"
            className="text-[#40467b] hover:text-[#686ea3] mb-4 inline-flex items-center font-medium transition-colors"
          >
            ← Späť na zoznam
          </Link>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-4">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                {isNew ? 'Nové duchovné cvičenie' : exercise?.title}
              </h1>
              {!isNew && exercise && (
                <p className="text-indigo-100 mt-2">
                  {exercise.locale?.native_name} • {exercise.is_published ? '✓ Publikované' : 'Nepublikované'}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Tabs - only show for existing exercises */}
        {!isNew && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="flex overflow-x-auto border-b border-gray-200">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-6 py-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'basic'
                    ? 'border-[#40467b] text-[#40467b] bg-indigo-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Základné info
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-6 py-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'pricing'
                    ? 'border-[#40467b] text-[#40467b] bg-indigo-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Ceny <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">{pricing.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`px-6 py-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'testimonials'
                    ? 'border-[#40467b] text-[#40467b] bg-indigo-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Hodnotenia <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">{testimonials.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-6 py-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'gallery'
                    ? 'border-[#40467b] text-[#40467b] bg-indigo-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Galéria <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">{gallery.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('registrations')}
                className={`px-6 py-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'registrations'
                    ? 'border-[#40467b] text-[#40467b] bg-indigo-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Registrácie <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">{registrationStats.total}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Basic Info Tab - always show for new, or when tab is active for existing */}
          {(isNew || activeTab === 'basic') && (
            <form onSubmit={handleBasicInfoSubmit} className="space-y-8">
              {/* Same structure as create form */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Základné informácie</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Názov <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      URL: /spiritual-exercises/<strong>{formData.slug}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jazyk <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="locale_id"
                      required
                      value={formData.locale_id}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="" disabled>Vyberte jazyk...</option>
                      {locales.map((locale) => (
                        <option key={locale.id} value={locale.id} className="text-gray-900">
                          {locale.native_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <SimpleRichTextEditor
                      label="Krátky popis"
                      value={formData.description}
                      onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    />
                  </div>

                  <div>
                    <SimpleRichTextEditor
                      label="Úplný popis"
                      value={formData.full_description}
                      onChange={(value) => setFormData(prev => ({ ...prev, full_description: value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hlavný obrázok
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <ImageUploadCrop
                          supabase={supabase}
                          currentImageUrl={formData.image_url}
                          onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                          bucketName="spiritual-exercises"
                          folder="images"
                          showPreview={false}
                        />
                      </div>
                      {formData.image_url && (
                        <div className="flex-shrink-0">
                          <Image
                            src={formData.image_url}
                            alt="Náhľad"
                            width={120}
                            height={120}
                            className="rounded-lg border-2 border-gray-200 shadow-sm object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ilustračný obrázok (domovská stránka)
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <ImageUploadCrop
                          supabase={supabase}
                          currentImageUrl={formData.home_image_url}
                          onImageUploaded={(url) => setFormData(prev => ({ ...prev, home_image_url: url }))}
                          bucketName="spiritual-exercises"
                          folder="home-images"
                          showPreview={false}
                        />
                      </div>
                      {formData.home_image_url && (
                        <div className="flex-shrink-0">
                          <Image
                            src={formData.home_image_url}
                            alt="Náhľad domovský"
                            width={120}
                            height={120}
                            className="rounded-lg border-2 border-gray-200 shadow-sm object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Termín</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Začiatok <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      required
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Koniec <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      required
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Miesto</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Názov miesta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location_name"
                      required
                      value={formData.location_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresa
                    </label>
                    <input
                      type="text"
                      name="location_address"
                      value={formData.location_address}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mesto
                      </label>
                      <input
                        type="text"
                        name="location_city"
                        value={formData.location_city}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Krajina
                      </label>
                      <input
                        type="text"
                        name="location_country"
                        value={formData.location_country}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Lektor / Vedúci</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meno lektora
                    </label>
                    <input
                      type="text"
                      name="leader_name"
                      value={formData.leader_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <SimpleRichTextEditor
                      label="Biografia lektora"
                      value={formData.leader_bio}
                      onChange={(value) => setFormData(prev => ({ ...prev, leader_bio: value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fotka lektora
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <ImageUploadCrop
                          supabase={supabase}
                          currentImageUrl={formData.leader_photo}
                          onImageUploaded={(url) => setFormData(prev => ({ ...prev, leader_photo: url }))}
                          bucketName="spiritual-exercises"
                          folder="leaders"
                          aspect={1}
                          showPreview={false}
                        />
                      </div>
                      {formData.leader_photo && (
                        <div className="flex-shrink-0">
                          <Image
                            src={formData.leader_photo}
                            alt="Lektor"
                            width={100}
                            height={100}
                            className="rounded-full border-2 border-gray-200 shadow-sm object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Nastavenia</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximálna kapacita
                    </label>
                    <input
                      type="number"
                      name="max_capacity"
                      min="1"
                      value={formData.max_capacity}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_published"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                      Publikované (viditeľné na webe)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Link
                  href="/admin/spiritual-exercises"
                  className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                >
                  Zrušiť
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white rounded-xl hover:from-[#686ea3] hover:to-[#40467b] font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {saving ? (isNew ? 'Vytváram...' : 'Ukladám...') : (isNew ? 'Vytvoriť cvičenie' : 'Uložiť zmeny')}
                </button>
              </div>
            </form>
          )}

          {/* Pricing Tab - only for existing exercises */}
          {!isNew && activeTab === 'pricing' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Cenník</h2>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowPricingModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white rounded-xl hover:from-[#686ea3] hover:to-[#40467b] font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  + Pridať cenu
                </button>
              </div>

              {pricing.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💰</span>
                  </div>
                  <p className="text-gray-500">Zatiaľ žiadne ceny</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pricing.map((item) => (
                    <div key={item.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-[#40467b] transition-all hover:shadow-md">
                      <h3 className="font-semibold text-gray-900 text-lg">{item.room_type}</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Cena: <span className="font-semibold text-gray-900">€{item.price}</span></p>
                        <p className="text-sm text-gray-600">Záloha: <span className="font-semibold text-gray-900">€{item.deposit || 50}</span></p>
                        <p className="text-2xl font-bold text-[#40467b] mt-1">Spolu: €{(item.price + (item.deposit || 50)).toFixed(2)}</p>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-3">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-3">Poradie: {item.display_order}</p>
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowPricingModal(true);
                          }}
                          className="flex-1 text-[#40467b] hover:text-[#686ea3] font-semibold text-sm"
                        >
                          Upraviť
                        </button>
                        <button
                          onClick={() => handleDeletePricing(item.id)}
                          className="flex-1 text-red-600 hover:text-red-800 font-semibold text-sm"
                        >
                          Vymazať
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Testimonials Tab - only for existing exercises */}
          {!isNew && activeTab === 'testimonials' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Hodnotenia</h2>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowTestimonialModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  + Pridať hodnotenie
                </button>
              </div>

              {testimonials.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Zatiaľ žiadne hodnotenia</p>
              ) : (
                <div className="space-y-3">
                  {testimonials.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.author_name}</h3>
                          {item.rating && (
                            <div className="flex items-center mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < item.rating! ? 'text-yellow-400' : 'text-gray-300'}>
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowTestimonialModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Upraviť
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(item.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Vymazať
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700">{item.testimonial_text}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>Poradie: {item.display_order}</span>
                        <span className={item.is_visible ? 'text-green-600' : 'text-red-600'}>
                          {item.is_visible ? 'Viditeľné' : 'Skryté'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gallery Tab - only for existing exercises */}
          {!isNew && activeTab === 'gallery' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Galéria</h2>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowGalleryModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  + Pridať fotku
                </button>
              </div>

              {gallery.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Zatiaľ žiadne fotky</p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {gallery.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden">
                      <div className="relative h-48">
                        <Image
                          src={item.image_url}
                          alt={item.alt_text || item.caption || 'Gallery image'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        {item.caption && <p className="text-sm text-gray-700 mb-2">{item.caption}</p>}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>Poradie: {item.display_order}</span>
                          <span className={item.is_visible ? 'text-green-600' : 'text-red-600'}>
                            {item.is_visible ? 'Viditeľné' : 'Skryté'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowGalleryModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex-1"
                          >
                            Upraviť
                          </button>
                          <button
                            onClick={() => handleDeleteGallery(item.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm flex-1"
                          >
                            Vymazať
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Registrations Tab - only for existing exercises */}
          {!isNew && activeTab === 'registrations' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Registrácie</h2>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-gray-600">Celkom: <strong>{registrationStats.total}</strong></span>
                    <span className="text-yellow-600">Čaká: <strong>{registrationStats.pending}</strong></span>
                    <span className="text-blue-600">Záloha: <strong>{registrationStats.deposit_paid}</strong></span>
                    <span className="text-green-600">Zaplatené: <strong>{registrationStats.fully_paid}</strong></span>
                    <span className="text-red-600">Zrušené: <strong>{registrationStats.cancelled}</strong></span>
                  </div>
                </div>
              </div>

              {registrations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Zatiaľ žiadne registrácie</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Meno</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Email</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Telefón</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Izba</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Cena</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Status platby</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Dátum</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Akcie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm">
                            <div className="font-medium text-gray-900">{reg.first_name} {reg.last_name}</div>
                            {reg.parish && <div className="text-xs text-gray-500">{reg.parish}</div>}
                          </td>
                          <td className="p-3 text-sm text-gray-700">{reg.email}</td>
                          <td className="p-3 text-sm text-gray-700">{reg.phone}</td>
                          <td className="p-3 text-sm text-gray-700">{reg.room_type}</td>
                          <td className="p-3 text-sm font-medium">{reg.payment_amount} €</td>
                          <td className="p-3 text-sm">
                            <select
                              value={reg.payment_status}
                              onChange={(e) => handleUpdateRegistrationStatus(reg.id, e.target.value as PaymentStatus)}
                              className={`px-2 py-1 rounded text-xs font-medium border ${
                                reg.payment_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                reg.payment_status === 'deposit_paid' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                reg.payment_status === 'fully_paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              <option value="pending">Čaká na platbu</option>
                              <option value="deposit_paid">Záloha zaplatená</option>
                              <option value="fully_paid">Plne zaplatené</option>
                              <option value="cancelled">Zrušené</option>
                            </select>
                          </td>
                          <td className="p-3 text-sm text-gray-700">
                            {new Date(reg.registration_date).toLocaleDateString('sk-SK')}
                          </td>
                          <td className="p-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(reg);
                                  setShowRegistrationModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => handleDeleteRegistration(reg.id)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Vymazať
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingModal
          item={editingItem as SpiritualExercisePricing | null}
          onSave={handleSavePricing}
          onClose={() => {
            setShowPricingModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <TestimonialModal
          item={editingItem as SpiritualExerciseTestimonial | null}
          onSave={handleSaveTestimonial}
          onClose={() => {
            setShowTestimonialModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <GalleryModal
          item={editingItem as SpiritualExerciseGallery | null}
          onSave={handleSaveGallery}
          onClose={() => {
            setShowGalleryModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Registration Detail Modal */}
      {Boolean(showRegistrationModal) && (
        <RegistrationModal
          item={editingItem as SpiritualExerciseRegistration | null}
          onClose={() => {
            setShowRegistrationModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

// Modal components
interface PricingModalProps {
  item: SpiritualExercisePricing | null;
  onSave: (data: Partial<SpiritualExercisePricing>) => void;
  onClose: () => void;
}

function PricingModal({ item, onSave, onClose }: PricingModalProps) {
  const [formData, setFormData] = useState({
    room_type: item?.room_type || '',
    price: item?.price ? String(item.price) : '',
    deposit: item?.deposit ? String(item.deposit) : '50.00',
    description: item?.description || '',
    display_order: item?.display_order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      deposit: parseFloat(formData.deposit),
      display_order: parseInt(String(formData.display_order)),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {item ? 'Upraviť cenu' : 'Pridať cenu'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ izby <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.room_type}
              onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Jednolôžková izba"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cena (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="280.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Záloha (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="50.00"
            />
            <p className="text-xs text-gray-500 mt-1">Manipulačný poplatok pre tento typ izby</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="s vlastným WC"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poradie</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Uložiť
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TestimonialModalProps {
  item: SpiritualExerciseTestimonial | null;
  onSave: (data: Partial<SpiritualExerciseTestimonial>) => void;
  onClose: () => void;
}

function TestimonialModal({ item, onSave, onClose }: TestimonialModalProps) {
  const [formData, setFormData] = useState({
    author_name: item?.author_name || '',
    testimonial_text: item?.testimonial_text || '',
    rating: item?.rating || 5,
    display_order: item?.display_order || 0,
    is_visible: item?.is_visible ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      rating: parseInt(String(formData.rating)),
      display_order: parseInt(String(formData.display_order)),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {item ? 'Upraviť hodnotenie' : 'Pridať hodnotenie'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meno autora <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Mária K."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hodnotenie (1-5)
            </label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
            >
              <option value="1">★ 1</option>
              <option value="2">★★ 2</option>
              <option value="3">★★★ 3</option>
              <option value="4">★★★★ 4</option>
              <option value="5">★★★★★ 5</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={formData.testimonial_text}
              onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Skvelá skúsenosť..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poradie</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_visible"
              checked={formData.is_visible}
              onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="is_visible" className="ml-2 text-sm text-gray-900">
              Viditeľné na webe
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Uložiť
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface GalleryModalProps {
  item: SpiritualExerciseGallery | null;
  onSave: (data: Partial<SpiritualExerciseGallery>) => void;
  onClose: () => void;
}

function GalleryModal({ item, onSave, onClose }: GalleryModalProps) {
  const [formData, setFormData] = useState({
    image_url: item?.image_url || '',
    caption: item?.caption || '',
    alt_text: item?.alt_text || '',
    display_order: item?.display_order || 0,
    is_visible: item?.is_visible ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      display_order: parseInt(String(formData.display_order)),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {item ? 'Upraviť fotku' : 'Pridať fotku'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL obrázka <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Popisok</label>
            <input
              type="text"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Pohľad na exercičný dom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt text</label>
            <input
              type="text"
              value={formData.alt_text}
              onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Exercičný dom v Dobrej Vode"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poradie</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="gallery_visible"
              checked={formData.is_visible}
              onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="gallery_visible" className="ml-2 text-sm text-gray-900">
              Viditeľné na webe
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Uložiť
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RegistrationModalProps {
  item: SpiritualExerciseRegistration | null;
  onClose: () => void;
}

function RegistrationModal({ item, onClose }: RegistrationModalProps) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 my-8">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">Detail registrácie</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="space-y-4">
          <div><h4 className="font-semibold text-gray-900 mb-2">Kontakt</h4>
            <p>{item.first_name} {item.last_name}</p><p>{item.email} • {item.phone}</p>
          </div>
          <div><h4 className="font-semibold text-gray-900 mb-2">Ubytovanie</h4>
            <p>{item.room_type} • {item.payment_amount} €</p>
          </div>
        </div>
        <div className="flex justify-end pt-6 mt-6 border-t">
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Zavrieť</button>
        </div>
      </div>
    </div>
  );
}
