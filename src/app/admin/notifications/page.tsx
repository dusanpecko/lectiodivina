//src/app/admin/notifications/page.tsx

"use client";

import { useState, useEffect } from 'react';

interface NotificationData {
  title: string;
  body: string;
  locale: string;
  topic: 'regular' | 'occasional';
  scheduled_at?: string;
  image_url?: string;
}

interface SendResponse {
  success: boolean;
  message: string;
  sent_count?: number;
  debugInfo?: any;
}

interface Locale {
  code: string;
  name: string;
}

export default function NotificationsAdmin() {
  const [formData, setFormData] = useState<NotificationData>({
    title: '',
    body: '',
    locale: 'sk',
    topic: 'regular',
    scheduled_at: '',
    image_url: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [locales, setLocales] = useState<Locale[]>([]);

  const topics = [
    { value: 'regular', label: 'Pravidelné notifikácie' },
    { value: 'occasional', label: 'Príležitostné notifikácie' }
  ];

  useEffect(() => {
    fetchLocales();
  }, []);

  const fetchLocales = async () => {
    try {
      const response = await fetch('/api/locales');
      if (response.ok) {
        const data = await response.json();
        setLocales(data);
      } else {
        console.warn('Locales fetch failed with status', response.status);
        // Fallback locales
        setLocales([
          { code: 'sk', name: 'Slovenčina' },
          { code: 'en', name: 'English' },
          { code: 'cz', name: 'Čeština' },
          { code: 'es', name: 'Español' },
          { code: 'de', name: 'Deutsch' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching locales:', error);
      setLocales([
        { code: 'sk', name: 'Slovenčina' },
        { code: 'en', name: 'English' },
        { code: 'cz', name: 'Čeština' },
        { code: 'es', name: 'Español' },
        { code: 'de', name: 'Deutsch' }
      ]);
    }
  };

  const validateImageUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // Prázdna URL je platná
    try {
      const urlObj = new URL(url);
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const pathname = urlObj.pathname.toLowerCase();
      return allowedExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.body.trim()) {
      setMessage({ type: 'error', text: 'Nadpis a obsah sú povinné.' });
      return;
    }

    if (formData.image_url && formData.image_url.trim() && !validateImageUrl(formData.image_url)) {
      setMessage({ type: 'error', text: 'Neplatná URL obrázka. Podporované formáty: JPG, PNG, GIF.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'abc587def456ghi321-admin-lectio-divina-2024';
      const url = `/api/admin/send-notification${debugMode ? '?debug=1' : ''}`;
      
      // Vyčistenie dát pred odoslaním - prázdne stringy konvertujeme na undefined
      const cleanedFormData = {
        ...formData,
        image_url: formData.image_url?.trim() || undefined,
        scheduled_at: formData.scheduled_at?.trim() || undefined
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(cleanedFormData),
      });

      let result: SendResponse;
      try {
        result = await response.json();
      } catch {
        result = { success: false, message: 'Neplatná odpoveď zo servera.' };
      }

      if (result.debugInfo) {
        console.groupCollapsed('[NotificationsAdmin] Debug info');
        console.log(result.debugInfo);
        console.groupEnd();
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: formData.scheduled_at && formData.scheduled_at.length > 0
            ? `Notifikácia naplánovaná na ${new Date(formData.scheduled_at).toLocaleString('sk-SK')}.`
            : `Notifikácia úspešne odoslaná!${typeof result.sent_count === 'number' ? ` Doručené na ${result.sent_count} zariadení.` : ''}`
        });
        setFormData({
          title: '',
          body: '',
          locale: 'sk',
          topic: 'regular',
          scheduled_at: '',
          image_url: ''
        });
      } else {
        setMessage({ type: 'error', text: result.message || 'Odoslanie zlyhalo.' });
      }
    } catch (error) {
      console.error('Send error:', error);
      setMessage({ type: 'error', text: 'Chyba pri odosielaní notifikácie.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof NotificationData, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value === '' ? '' : value 
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Administrácia Push Notifikácií
            </h1>
            <p className="text-gray-600 mt-2">
              Odosielanie notifikácií pre mobilnú aplikáciu Lectio Divina
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="debugMode"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
            />
            <label htmlFor="debugMode" className="text-sm text-gray-600 select-none">
              Debug mód
            </label>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {message && (
              <div className={`p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Nadpis notifikácie *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Napríklad: Dnešné Božie slovo"
                maxLength={100}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximálne 100 znakov ({formData.title.length}/100)
              </p>
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                Obsah notifikácie *
              </label>
              <textarea
                id="body"
                value={formData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Obsah notifikácie..."
                maxLength={300}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximálne 300 znakov ({formData.body.length}/300)
              </p>
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                URL obrázka (voliteľné)
              </label>
              <input
                type="url"
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  handleInputChange('image_url', value);
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Odporúčaný rozmer: 1024x512px, formáty: JPG, PNG, GIF. Maximálne 1MB.
              </p>
              {formData.image_url && formData.image_url.trim() && validateImageUrl(formData.image_url) && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="Náhľad obrázka"
                    className="h-20 w-40 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
                  Jazyk
                </label>
                <select
                  id="locale"
                  value={formData.locale}
                  onChange={(e) => handleInputChange('locale', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {locales.map(locale => (
                    <option key={locale.code} value={locale.code}>
                      {locale.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                  Typ notifikácie
                </label>
                <select
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value as 'regular' | 'occasional')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {topics.map(topic => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700">
                Naplánovaný čas odoslania (voliteľné)
              </label>
              <input
                type="datetime-local"
                id="scheduled_at"
                value={formData.scheduled_at}
                onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Nechajte prázdne pre okamžité odoslanie
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Náhľad notifikácie:</h3>
              <div className="bg-white p-3 rounded border shadow-sm max-w-sm">
                {formData.image_url && formData.image_url.trim() && validateImageUrl(formData.image_url) && (
                  <img
                    src={formData.image_url}
                    alt="Náhľad"
                    className="w-full h-24 object-cover rounded mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="font-semibold text-sm text-gray-900">
                  {formData.title || 'Nadpis notifikácie'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {formData.body || 'Obsah notifikácie'}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Lectio Divina • {locales.find(l => l.code === formData.locale)?.name}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Zrušiť
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Odosielam...
                  </span>
                ) : (
                  formData.scheduled_at ? 'Naplánovať notifikáciu' : 'Odoslať notifikáciu'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Informácie o notifikáciách</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Pravidelné notifikácie:</strong> Denné citáty, Božie slovo, modlitby</p>
            <p><strong>Príležitostné notifikácie:</strong> Novinky, oznamy, špeciálne udalosti</p>
            <p><strong>Cieľová skupina:</strong> Notifikácia sa odošle všetkým používateľom vybraného jazyka</p>
            <p><strong>Obrázky:</strong> Rich notifikácie s obrázkami zvyšujú engagement o 20-30%</p>
            <p><strong>Formát dát:</strong> Notifikácia obsahuje aj locale pre správne spracovanie v aplikácii</p>
          </div>
        </div>
      </div>
    </div>
  );
}