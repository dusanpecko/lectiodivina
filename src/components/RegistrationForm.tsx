'use client';

import { createClient } from '@/app/lib/supabase/client';
import type { SpiritualExercisePricing } from '@/types/spiritual-exercises';
import { useEffect, useState } from 'react';

interface RegistrationFormProps {
  exerciseSlug: string;
  exerciseTitle: string;
  pricing: SpiritualExercisePricing[];
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  id_card_number: string;
  city: string;
  street: string;
  postal_code: string;
  parish: string;
  diocese: string;
  room_type: string;
  dietary_restrictions: string;
  notes: string;
  referral_source: string;
  gdpr_consent: boolean;
  responsibility_consent: boolean;
  newsletter_consent: boolean;
}

const REFERRAL_SOURCES = [
  'Z aplikácie Lectio divina',
  'Od známych',
  'Z internetu',
  'Od kňaza',
  'Iné'
];

const SLOVAK_DIOCESES = [
  'Bratislavská',
  'Trnavská',
  'Nitrianská',
  'Banskobystrická',
  'Žilinská',
  'Košická',
  'Rožňavská',
  'Spišská',
  'Gréckokatolícka eparchia Prešov',
  'Gréckokatolícka eparchia Košice',
  'Gréckokatolícka eparchia Bratislava',
  'Iná'
];

export default function RegistrationForm({
  exerciseSlug,
  exerciseTitle,
  pricing,
  onSuccess,
  onCancel
}: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    birth_date: '',
    id_card_number: '',
    city: '',
    street: '',
    postal_code: '',
    parish: '',
    diocese: '',
    room_type: pricing.length > 0 ? pricing[0].room_type : '',
    dietary_restrictions: '',
    notes: '',
    referral_source: '',
    gdpr_consent: false,
    responsibility_consent: false,
    newsletter_consent: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showGdprModal, setShowGdprModal] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userId, setUserId] = useState<string | null>(null);
  const [showSaveProfileModal, setShowSaveProfileModal] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [hasProfileData, setHasProfileData] = useState(false);

  // Fetch user profile and autofill form if authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      console.log('🔍 Auth check:', { user: user?.id, error: authError });
      
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.id);
        
        // Fetch profile data from users table (including shipping_address JSONB)
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('full_name, email, shipping_address')
          .eq('id', user.id)
          .single();
        
        console.log('📋 Profile data:', { profile, error: profileError });
        
        if (profile) {
          // Extract data from shipping_address JSONB object
          const shippingAddr = profile.shipping_address as {
            name?: string;
            email?: string;
            phone?: string;
            street?: string;
            city?: string;
            postal_code?: string;
            country?: string;
          } | null;
          
          // Check if user has profile data (from shipping_address)
          const hasData = !!(shippingAddr?.phone || shippingAddr?.street || shippingAddr?.city);
          setHasProfileData(hasData);
          
          console.log('✅ Has profile data:', hasData, 'Shipping address:', shippingAddr);
          
          // Split full_name into first_name and last_name
          let firstName = '';
          let lastName = '';
          if (profile.full_name) {
            const nameParts = profile.full_name.trim().split(' ');
            if (nameParts.length > 1) {
              firstName = nameParts[0];
              lastName = nameParts.slice(1).join(' ');
            } else {
              firstName = profile.full_name;
            }
          }
          
          console.log('👤 Name split:', { firstName, lastName, original: profile.full_name });
          
          // Autofill form with profile data (prioritize shipping_address)
          setFormData(prev => ({
            ...prev,
            email: profile.email || prev.email,
            first_name: firstName || prev.first_name,
            last_name: lastName || prev.last_name,
            phone: shippingAddr?.phone || prev.phone,
            street: shippingAddr?.street || prev.street,
            city: shippingAddr?.city || prev.city,
            postal_code: shippingAddr?.postal_code || prev.postal_code,
          }));
          
          console.log('📝 Form autofilled from shipping_address');
        } else {
          console.log('❌ No profile data found');
        }
      } else {
        console.log('❌ User not authenticated');
      }
    };
    
    fetchUserProfile();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Slovak phone format: +421XXXXXXXXX or 0XXXXXXXXX
    const phoneRegex = /^(\+421|0)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateBirthDate = (date: string): boolean => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18 && age <= 100;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Required fields
    if (!formData.email.trim()) newErrors.email = 'Email je povinný';
    else if (!validateEmail(formData.email)) newErrors.email = 'Neplatný formát emailu';

    if (!formData.first_name.trim()) newErrors.first_name = 'Meno je povinné';
    if (!formData.last_name.trim()) newErrors.last_name = 'Priezvisko je povinné';
    
    if (!formData.phone.trim()) newErrors.phone = 'Telefón je povinný';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Neplatný formát telefónu (napr. +421901234567)';

    if (!formData.birth_date) newErrors.birth_date = 'Dátum narodenia je povinný';
    else if (!validateBirthDate(formData.birth_date)) newErrors.birth_date = 'Musíte mať 18-100 rokov';

    if (!formData.id_card_number.trim()) newErrors.id_card_number = 'Číslo OP je povinné';
    if (!formData.city.trim()) newErrors.city = 'Mesto je povinné';
    if (!formData.street.trim()) newErrors.street = 'Ulica je povinná';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'PSČ je povinné';
    if (!formData.room_type) newErrors.room_type = 'Vyberte typ ubytovania';

    // GDPR consents
    if (!formData.gdpr_consent) newErrors.gdpr_consent = 'Musíte súhlasiť so spracovaním údajov';
    if (!formData.responsibility_consent) newErrors.responsibility_consent = 'Musíte potvrdiť vyhlásenie o zodpovednosti';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/spiritual-exercises/${exerciseSlug}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodarilo sa odoslať registráciu');
      }

      // Show appropriate modal after successful registration
      if (isAuthenticated && !hasProfileData) {
        setShowSaveProfileModal(true);
      } else if (!isAuthenticated) {
        setShowRegisterPrompt(true);
      } else {
        onSuccess();
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Nastala neočakávaná chyba');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`/api/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: `${formData.first_name} ${formData.last_name}`.trim(),
          shipping_address: {
            name: `${formData.first_name} ${formData.last_name}`.trim(),
            email: formData.email,
            phone: formData.phone,
            street: formData.street,
            city: formData.city,
            postal_code: formData.postal_code,
            country: 'Slovensko',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodarilo sa uložiť profil');
      }

      setShowSaveProfileModal(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving profile:', error);
      // Continue anyway
      setShowSaveProfileModal(false);
      onSuccess();
    }
  };

  const selectedPrice = pricing.find(p => p.room_type === formData.room_type);

  return (
    <>
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-10">
        {serverError && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-xl font-medium shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <section className="pb-8 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Kontaktné údaje
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Meno <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.first_name ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priezvisko <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefón <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+421901234567"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </section>

        {/* Personal Information */}
        <section className="pb-8 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            Osobné údaje
          </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dátum narodenia <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.birth_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.birth_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Číslo občianskeho preukazu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.id_card_number}
                  onChange={(e) => handleChange('id_card_number', e.target.value)}
                  placeholder="AA123456"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.id_card_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.id_card_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.id_card_number}</p>
                )}
              </div>
            </div>
          </section>

        {/* Address */}
        <section className="pb-8 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Adresa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ulica a číslo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleChange('street', e.target.value)}
                  placeholder="Hlavná 123"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.street ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.street && (
                  <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mesto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PSČ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  placeholder="01001"
                  maxLength={5}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.postal_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.postal_code && (
                  <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>
                )}
              </div>
            </div>
          </section>

        {/* Church Information */}
        <section className="pb-8 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Cirkevné údaje <span className="text-sm font-normal text-gray-500">(nepovinné)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farnosť
                </label>
                <input
                  type="text"
                  value={formData.parish}
                  onChange={(e) => handleChange('parish', e.target.value)}
                  placeholder="Farnosť sv. Petra"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diecéza
                </label>
                <select
                  value={formData.diocese}
                  onChange={(e) => handleChange('diocese', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Vyberte diecézu</option>
                  {SLOVAK_DIOCESES.map((diocese) => (
                    <option key={diocese} value={diocese}>
                      {diocese}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

        {/* Accommodation */}
        <section className="pb-8 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ubytovanie <span className="text-red-600">*</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pricing.map((price) => (
              <label
                key={price.id}
                className={`relative flex flex-col p-5 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md ${
                  formData.room_type === price.room_type
                    ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md'
                    : 'border-gray-300 hover:border-blue-400 bg-white'
                }`}
              >
                  <input
                    type="radio"
                    name="room_type"
                    value={price.room_type}
                    checked={formData.room_type === price.room_type}
                    onChange={(e) => handleChange('room_type', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900">{price.room_type}</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {price.price.toFixed(2)} € + {(price.deposit || 50).toFixed(2)} € záloha
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {(price.price + (price.deposit || 50)).toFixed(2)} €
                      </div>
                    </div>
                  </div>
                  {price.description && (
                    <span className="text-sm text-gray-600">{price.description}</span>
                  )}
                </label>
              ))}
            </div>
            {errors.room_type && (
              <p className="text-red-500 text-sm mt-2">{errors.room_type}</p>
            )}
            {selectedPrice && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong>Cena za izbu:</strong> {selectedPrice.price.toFixed(2)} € + <strong>Záloha:</strong> {(selectedPrice.deposit || 50).toFixed(2)} € = <strong className="text-blue-600">{(selectedPrice.price + (selectedPrice.deposit || 50)).toFixed(2)} €</strong>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Na potvrdenie registrácie je potrebné uhradiť zálohu {(selectedPrice.deposit || 50).toFixed(2)} €. Platobné inštrukcie obdržíte emailom.
                </p>
              </div>
            )}
          </section>

          {/* Additional Information */}
          <section className="pb-8 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Doplňujúce informácie
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Stravové obmedzenia
                </label>
                <textarea
                  value={formData.dietary_restrictions}
                  onChange={(e) => handleChange('dietary_restrictions', e.target.value)}
                  placeholder="Napr. bezlepková diéta, vegetariánska strava, alergie..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Poznámky
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Ďalšie informácie, ktoré chcete zdieľať..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Ako ste sa o nás dozvedeli?
                </label>
                <select
                  value={formData.referral_source}
                  onChange={(e) => handleChange('referral_source', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Vyberte možnosť</option>
                  {REFERRAL_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Consents */}
          <section className="pb-8 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Súhlasy a podmienky
            </h3>
            <div className="space-y-5">
              <label className={`flex items-start ${errors.gdpr_consent ? 'text-red-700' : ''}`}>
                <input
                  type="checkbox"
                  checked={formData.gdpr_consent}
                  onChange={(e) => handleChange('gdpr_consent', e.target.checked)}
                  className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">
                  <span className="text-red-600">*</span> Súhlasím so spracovaním osobných údajov v zmysle GDPR.{' '}
                  <button
                    type="button"
                    onClick={() => setShowGdprModal(true)}
                    className="text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Prečítať viac
                  </button>
                </span>
              </label>
              {errors.gdpr_consent && (
                <p className="text-red-600 text-sm font-medium ml-8">{errors.gdpr_consent}</p>
              )}

              <label className={`flex items-start ${errors.responsibility_consent ? 'text-red-700' : ''}`}>
                <input
                  type="checkbox"
                  checked={formData.responsibility_consent}
                  onChange={(e) => handleChange('responsibility_consent', e.target.checked)}
                  className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">
                  <span className="text-red-600">*</span> Beriem na vedomie, že {exerciseTitle} nie sú náhradou lekárskej alebo psychoterapeutickej starostlivosti. Účasť na cvičeniach je dobrovoľná. Účastník nesie celý čas trvania programu za seba a za všetko, čo koná, plnú zodpovednosť. Pokyny lektorov sú len návrhy, ktorými sa účastník riadi dobrovoľne podľa vlastného uváženia. Účastník mladší ako osemnásť (18) rokov je povinný dodať organizátorom pred cvičeniami písomný súhlas rodiča alebo zákonného zástupcu s účasťou na cvičeniach, pokiaľ sa na cvičeniach nezúčastňuje v sprievode rodiča alebo zákonného zástupcu.
                </span>
              </label>
              {errors.responsibility_consent && (
                <p className="text-red-600 text-sm font-medium ml-8">{errors.responsibility_consent}</p>
              )}

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.newsletter_consent}
                  onChange={(e) => handleChange('newsletter_consent', e.target.checked)}
                  className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">
                  Chcem dostávať informácie o ďalších duchovných cvičeniach a aktivitách (newsletter).
                </span>
              </label>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-8 mt-8">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-8 py-3.5 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Odosiela sa...
                </>
              ) : (
                'Odoslať registráciu'
              )}
            </button>
          </div>
        </form>

        {/* GDPR Modal */}
        {showGdprModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Informácie o ochrane osobných údajov (GDPR)
            </h3>
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                <strong>Správca údajov:</strong> KROK – Pastoračný fond Žilinskej diecézy, 
                Jána Kalinčiaka 1, 010 01 Žilina, IČO: 37870475
              </p>
              
              <div>
                <strong>Účel spracúvania:</strong>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Evidencia účastníkov duchovných cvičení</li>
                  <li>Zabezpečenie ubytovania a stravovania</li>
                  <li>Komunikácia týkajúca sa organizácie podujatia</li>
                  <li>Vystavenie potvrdenia o účasti (ak potrebné)</li>
                </ul>
              </div>

              <div>
                <strong>Právny základ:</strong>
                <p className="mt-1">
                  Spracúvanie údajov je nevyhnutné pre plnenie zmluvy (účasť na duchovných cvičeniach) 
                  a váš súhlas so spracovaním osobných údajov.
                </p>
              </div>

              <div>
                <strong>Doba uchovávania:</strong>
                <p className="mt-1">
                  Vaše údaje budú uchovávané počas trvania podujatia a maximálne 5 rokov 
                  po jeho skončení na účely archivácie a štatistiky.
                </p>
              </div>

              <div>
                <strong>Vaše práva:</strong>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Právo na prístup k osobným údajom</li>
                  <li>Právo na opravu nesprávnych údajov</li>
                  <li>Právo na výmaz údajov</li>
                  <li>Právo na obmedzenie spracovania</li>
                  <li>Právo namietať proti spracovaniu</li>
                  <li>Právo na prenosnosť údajov</li>
                  <li>Právo podať sťažnosť na Úrad na ochranu osobných údajov SR</li>
                </ul>
              </div>

              <p>
                <strong>Kontakt:</strong> Pre uplatnenie vašich práv nás kontaktujte na 
                <a href="mailto:info@lectio.one" className="text-blue-600 hover:text-blue-800 ml-1">
                  info@lectio.one
                </a>
              </p>
            </div>
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setShowGdprModal(false)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
              >
                Zavrieť
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Save Profile Modal */}
        {showSaveProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Registrácia úspešná!</h3>
              <p className="text-gray-600 mb-6">
                Chcete uložiť vyplnené údaje do svojho profilu? Uľahčí to budúce registrácie.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSaveProfileModal(false);
                    onSuccess();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Nie, ďakujem
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  Áno, uložiť
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Register Prompt Modal */}
        {showRegisterPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Registrácia úspešná!</h3>
              <p className="text-gray-600 mb-6">
                Chcete si vytvoriť účet pre jednoduchšie prihlásenie na ďalšie duchovné cvičenia?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRegisterPrompt(false);
                    onSuccess();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Teraz nie
                </button>
                <a
                  href="/login"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all text-center"
                >
                  Vytvoriť účet
                </a>
              </div>
            </div>
          </div>
        </div>
        )}
    </>
  );
}
