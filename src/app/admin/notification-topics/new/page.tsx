'use client';

import '@/app/admin/admin-edit.css';
import { FormSection } from '@/app/admin/components';
import TranslateButton from '@/app/components/TranslateButton';
import { AVAILABLE_COLORS, AVAILABLE_ICONS, TOPIC_CATEGORIES } from '@/app/types/notificationTopics';
import {
  AlertCircle, ArrowLeft,
  CheckCircle,
  Eye,
  FileText,
  Globe, Hash,
  Palette,
  Plus,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewNotificationTopicPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name_sk: '',
    name_en: '',
    name_cs: '',
    name_es: '',
    slug: '',
    description_sk: '',
    description_en: '',
    description_cs: '',
    description_es: '',
    icon: 'bell',
    color: '#4A5085',
    is_active: true,
    is_default: false,
    display_order: 0,
    category: 'spiritual',
  });

  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setValidationErrors([]);

    // Validácia povinných polí
    const errors: string[] = [];
    if (!formData.name_sk.trim()) errors.push('name_sk');
    if (!formData.slug.trim()) errors.push('slug');

    if (errors.length > 0) {
      setValidationErrors(errors);
      setError('Prosím vyplňte všetky povinné polia');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/notification-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Téma notifikácií bola úspešne vytvorená');
        setMessageType('success');
        
        // Presmerovanie po krátkom čakaní
        setTimeout(() => {
          router.push('/admin/notification-topics');
        }, 1500);
      } else {
        setError(data.error || 'Chyba pri vytváraní témy');
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setError('Nepodarilo sa vytvoriť tému');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData({
      ...formData,
      name_sk: value,
      slug: generateSlug(value),
    });
  };



  // Hromadné preloženie všetkých jazykov
  const translateAllNames = async () => {
    if (!formData.name_sk.trim() || loading) {
      setMessage('Najprv vyplňte slovenský názov');
      setMessageType('info');
      return;
    }
    
    setLoading(true);
    try {
      // Parallelne preložiť do všetkých jazykov
      const [enPromise, csPromise, esPromise] = await Promise.allSettled([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: formData.name_sk,
            targetLanguage: 'en',
            fieldType: 'general'
          })
        }),
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: formData.name_sk,
            targetLanguage: 'cs',
            fieldType: 'general'
          })
        }),
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: formData.name_sk,
            targetLanguage: 'es',
            fieldType: 'general'
          })
        })
      ]);

      const results = await Promise.allSettled([
        enPromise.status === 'fulfilled' ? enPromise.value.json() : null,
        csPromise.status === 'fulfilled' ? csPromise.value.json() : null,
        esPromise.status === 'fulfilled' ? esPromise.value.json() : null
      ]);

      setFormData(prev => ({
        ...prev,
        name_en: results[0]?.status === 'fulfilled' && results[0].value?.translatedText ? results[0].value.translatedText : prev.name_en,
        name_cs: results[1]?.status === 'fulfilled' && results[1].value?.translatedText ? results[1].value.translatedText : prev.name_cs,
        name_es: results[2]?.status === 'fulfilled' && results[2].value?.translatedText ? results[2].value.translatedText : prev.name_es,
      }));

      setMessage('Názvy úspešne preložené do všetkých jazykov');
      setMessageType('success');
    } catch (error) {
      console.error('Chyba pri preklade:', error);
      setMessage('Chyba pri preklade názvov');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const translateAllDescriptions = async () => {
    if (!formData.description_sk.trim() || loading) {
      setMessage('Najprv vyplňte slovenský popis');
      setMessageType('info');
      return;
    }

    setLoading(true);
    try {
      // Parallelne preložiť do všetkých jazykov
      const [enPromise, csPromise, esPromise] = await Promise.allSettled([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: formData.description_sk,
            targetLanguage: 'en',
            fieldType: 'general'
          })
        }),
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: formData.description_sk,
            targetLanguage: 'cs',
            fieldType: 'general'
          })
        }),
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: formData.description_sk,
            targetLanguage: 'es',
            fieldType: 'general'
          })
        })
      ]);

      const results = await Promise.allSettled([
        enPromise.status === 'fulfilled' ? enPromise.value.json() : null,
        csPromise.status === 'fulfilled' ? csPromise.value.json() : null,
        esPromise.status === 'fulfilled' ? esPromise.value.json() : null
      ]);

      setFormData(prev => ({
        ...prev,
        description_en: results[0]?.status === 'fulfilled' && results[0].value?.translatedText ? results[0].value.translatedText : prev.description_en,
        description_cs: results[1]?.status === 'fulfilled' && results[1].value?.translatedText ? results[1].value.translatedText : prev.description_cs,
        description_es: results[2]?.status === 'fulfilled' && results[2].value?.translatedText ? results[2].value.translatedText : prev.description_es,
      }));

      setMessage('Popisy úspešne preložené do všetkých jazykov');
      setMessageType('success');
    } catch (error) {
      console.error('Chyba pri preklade:', error);
      setMessage('Chyba pri preklade popisov');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getIconEmoji = (icon: string) => {
    const iconMap: Record<string, string> = {
      'book-open': '📖',
      'bell': '🔔',
      'hands-praying': '🙏',
      'rosary': '📿',
      'calendar': '📅',
      'star': '⭐',
      'heart': '❤️',
      'church': '⛪',
      'cross': '✝️',
      'bible': '📜',
      'candle': '🕯️',
      'dove': '🕊️',
    };
    return iconMap[icon] || '🔔';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="admin-edit-gradient-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Nová téma notifikácií</h1>
              <p className="opacity-90 mt-1">Vytvorenie novej témy pre push notifikácie</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => router.push('/admin/notification-topics')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                disabled={loading}
              >
                <ArrowLeft size={16} />
                Späť
              </button>
              <button 
                type="submit"
                form="notification-form"
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {loading ? 'Vytvára sa...' : 'Vytvoriť tému'}
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {(message || error) && (
          <div className={`rounded-lg p-4 mb-6 flex items-center gap-3 ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : messageType === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            {messageType === 'success' && <CheckCircle size={20} />}
            {messageType === 'error' && <AlertCircle size={20} />}
            {messageType === 'info' && <AlertCircle size={20} />}
            <span>{message || error}</span>
          </div>
        )}

        <form id="notification-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Základné informácie */}
          <FormSection title="Základné informácie" icon={FileText}>
            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="admin-edit-label">
                      <FileText size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                      Názov (SK) <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={translateAllNames}
                      disabled={!formData.name_sk.trim() || loading}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition disabled:opacity-50"
                    >
                      🌐 Preložiť všetky
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.name_sk}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    placeholder="Denné čítania"
                    className={`admin-edit-input ${validationErrors.includes('name_sk') ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {validationErrors.includes('name_sk') ? (
                    <p className="text-red-500 text-xs mt-1">Názov v slovenčine je povinný</p>
                  ) : (
                    <p className={`text-xs mt-1 ${(formData.name_sk?.length || 0) > 45 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                      {formData.name_sk?.length || 0}/50 znakov
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="admin-edit-label">
                      <Globe size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                      Názov (EN)
                    </label>
                    <TranslateButton
                      text={formData.name_sk || ""}
                      fieldType="general"
                      onTranslated={(translatedText) => setFormData(prev => ({...prev, name_en: translatedText}))}
                      disabled={!formData.name_sk.trim() || loading}
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Daily Readings"
                    className="admin-edit-input"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="admin-edit-label">
                      <Globe size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                      Názov (CS)
                    </label>
                    <TranslateButton
                      text={formData.name_sk || ""}
                      fieldType="general"
                      onTranslated={(translatedText) => setFormData(prev => ({...prev, name_cs: translatedText}))}
                      disabled={!formData.name_sk.trim() || loading}
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.name_cs}
                    onChange={(e) => setFormData({ ...formData, name_cs: e.target.value })}
                    placeholder="Denní čtení"
                    className="admin-edit-input"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="admin-edit-label">
                      <Globe size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                      Názov (ES)
                    </label>
                    <TranslateButton
                      text={formData.name_sk || ""}
                      fieldType="general"
                      onTranslated={(translatedText) => setFormData(prev => ({...prev, name_es: translatedText}))}
                      disabled={!formData.name_sk.trim() || loading}
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.name_es}
                    onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
                    placeholder="Lecturas diarias"
                    className="admin-edit-input"
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Popisy */}
          <FormSection title="Popis" icon={Eye}>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="admin-edit-label">
                    <Eye size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Popis (SK)
                  </label>
                  <button
                    type="button"
                    onClick={translateAllDescriptions}
                    disabled={!formData.description_sk.trim() || loading}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition disabled:opacity-50"
                  >
                    🌐 Preložiť všetky
                  </button>
                </div>
                <textarea
                  value={formData.description_sk}
                  onChange={(e) => setFormData({ ...formData, description_sk: e.target.value })}
                  rows={3}
                  placeholder="Pravidelné denné čítania z Písma svätého"
                  className="admin-edit-input resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="admin-edit-label">
                    <Globe size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Popis (EN)
                  </label>
                  <TranslateButton
                    text={formData.description_sk || ""}
                    fieldType="general"
                    onTranslated={(translatedText) => setFormData(prev => ({...prev, description_en: translatedText}))}
                    disabled={!formData.description_sk.trim() || loading}
                  />
                </div>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={3}
                  placeholder="Regular daily readings from Scripture"
                  className="admin-edit-input resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="admin-edit-label">
                    <Globe size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Popis (CS)
                  </label>
                  <TranslateButton
                    text={formData.description_sk || ""}
                    fieldType="general"
                    onTranslated={(translatedText) => setFormData(prev => ({...prev, description_cs: translatedText}))}
                    disabled={!formData.description_sk.trim() || loading}
                  />
                </div>
                <textarea
                  value={formData.description_cs}
                  onChange={(e) => setFormData({ ...formData, description_cs: e.target.value })}
                  rows={3}
                  placeholder="Pravidelné denní čtení z Písma"
                  className="admin-edit-input resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="admin-edit-label">
                    <Globe size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Popis (ES)
                  </label>
                  <TranslateButton
                    text={formData.description_sk || ""}
                    fieldType="general"
                    onTranslated={(translatedText) => setFormData(prev => ({...prev, description_es: translatedText}))}
                    disabled={!formData.description_sk.trim() || loading}
                  />
                </div>
                <textarea
                  value={formData.description_es}
                  onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                  rows={3}
                  placeholder="Lecturas regulares diarias de las Escrituras"
                  className="admin-edit-input resize-none"
                />
              </div>
            </div>
          </FormSection>

          {/* Vzhľad */}
          <FormSection title="Vzhľad" icon={Palette}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="admin-edit-label">
                  <Eye size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                  Ikona
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="admin-edit-input"
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {getIconEmoji(icon)} {icon}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-2xl">
                  {getIconEmoji(formData.icon)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="admin-edit-label">
                  <Palette size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                  Farba
                </label>
                <div className="flex gap-4 items-center mb-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="font-mono text-sm">{formData.color}</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded border-2 transition ${
                        formData.color === color 
                          ? 'border-gray-800' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Nastavenia */}
          <FormSection title="Nastavenia" icon={Settings}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="admin-edit-label">
                  <Hash size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="daily-readings"
                  pattern="[a-z0-9-]+"
                  title="Iba malé písmená, číslice a pomlčky"
                  className={`admin-edit-input ${validationErrors.includes('slug') ? 'border-red-300 focus:border-red-500' : ''}`}
                />
                {validationErrors.includes('slug') ? (
                  <p className="text-red-500 text-xs mt-1">Slug je povinný</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Unikátny identifikátor (iba malé písmená, číslice a pomlčky). Automaticky sa generuje z názvu SK.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <Settings size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Kategória
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="admin-edit-input"
                  >
                    {Object.entries(TOPIC_CATEGORIES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <Hash size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Poradie zobrazenia
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    min="0"
                    className="admin-edit-input"
                  />
                  <p className="text-xs text-gray-500">
                    Nižšie číslo = vyššie v zozname
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="admin-edit-label" style={{ marginBottom: 0 }}>Aktívna téma</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6">
                    Aktívne témy sa zobrazujú používateľom
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="admin-edit-label" style={{ marginBottom: 0 }}>Predvolená téma</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6">
                    Noví používatelia budú automaticky prihlásení na túto tému
                  </p>
                </div>
              </div>
            </div>
          </FormSection>
        </form>
      </div>
    </div>
  );
}
