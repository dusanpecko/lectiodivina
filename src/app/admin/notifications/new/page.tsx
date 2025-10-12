//src/app/admin/notifications/new/page.tsx

"use client";

import EditPageHeader from "@/app/admin/components/EditPageHeader";
import { Bell, Globe } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface NotificationData {
  title: string;
  body: string;
  locale: string;
  topic_id: string; // Zmenené z 'regular' | 'occasional' na UUID
  scheduled_at?: string;
  image_url?: string;
  // Deep linking fields
  screen?: string;
  screen_params?: string;
}

interface NotificationTopic {
  id: string;
  name_sk: string;
  slug: string;
  icon: string | null;
  color: string;
  is_active: boolean;
}

interface SendResponse {
  success: boolean;
  message: string;
  sent_count?: number;
  debugInfo?: Record<string, unknown>;
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
    topic_id: '', // Predvolená hodnota bude nastavená po načítaní tém
    scheduled_at: '',
    image_url: '',
    screen: '',
    screen_params: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [locales, setLocales] = useState<Locale[]>([]);
  const [topics, setTopics] = useState<NotificationTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);

  const fetchLocales = useCallback(async () => {
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
  }, []);

  const fetchTopics = useCallback(async () => {
    try {
      setTopicsLoading(true);
      const response = await fetch('/api/admin/notification-topics?active=true');
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics);
        
        // Nastav predvolenú tému (prvú aktívnu alebo prvú v zozname)
        if (data.topics.length > 0 && !formData.topic_id) {
          const defaultTopic = data.topics.find((t: NotificationTopic) => t.slug === 'daily-readings') || data.topics[0];
          setFormData(prev => ({ ...prev, topic_id: defaultTopic.id }));
        }
      } else {
        console.error('Failed to fetch topics');
        setMessage({ type: 'error', text: 'Nepodarilo sa načítať témy notifikácií' });
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      setMessage({ type: 'error', text: 'Chyba pri načítavaní tém' });
    } finally {
      setTopicsLoading(false);
    }
  }, [formData.topic_id]);

  useEffect(() => {
    fetchLocales();
    fetchTopics();
  }, [fetchLocales, fetchTopics]);

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

  const getIconEmoji = (icon: string | null) => {
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
    return iconMap[icon || 'bell'] || '🔔';
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
        // Po úspešnom odoslaní nastav predvolenú tému
        const defaultTopic = topics.find(t => t.slug === 'daily-readings') || topics[0];
        setFormData({
          title: '',
          body: '',
          locale: 'sk',
          topic_id: defaultTopic?.id || '',
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

  const getBackUrl = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin-notifications-page');
      return stored || '/admin/notifications';
    }
    return '/admin/notifications';
  };

  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <EditPageHeader
          title="Nová notifikácia"
          description="Odoslanie push notifikácie do mobilnej aplikácie"
          icon={Bell}
          emoji="📣"
          backUrl={getBackUrl()}
        />

        {/* Rýchle akcie */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Rýchle akcie</h3>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/notification-topics')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Spravovať témy notifikácií
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/notifications')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              História a štatistiky
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
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
                  <Image
                    src={formData.image_url}
                    alt="Image preview"
                    width={160}
                    height={80}
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
                <label htmlFor="topic_id" className="block text-sm font-medium text-gray-700">
                  Téma notifikácie *
                </label>
                {topicsLoading ? (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    Načítavam témy...
                  </div>
                ) : topics.length === 0 ? (
                  <div className="mt-1 block w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-700">
                    Žiadne aktívne témy. <Link href="/admin/notification-topics/new" className="underline">Vytvorte novú tému</Link>
                  </div>
                ) : (
                  <select
                    id="topic_id"
                    value={formData.topic_id}
                    onChange={(e) => handleInputChange('topic_id', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Vyberte tému...</option>
                    {topics.map(topic => {
                      const iconEmoji = getIconEmoji(topic.icon);
                      return (
                        <option key={topic.id} value={topic.id}>
                          {iconEmoji} {topic.name_sk}
                        </option>
                      );
                    })}
                  </select>
                )}
                {formData.topic_id && !topicsLoading && (
                  <p className="text-sm text-gray-500 mt-1">
                    Notifikácia bude poslaná len používateľom, ktorí si vybrali túto tému.
                  </p>
                )}
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

            {/* Deep Linking - Cieľová obrazovka */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Cieľová obrazovka (Deep Linking)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Určite, ktorá obrazovka sa otvorí v aplikácii po kliknutí na notifikáciu
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="screen" className="block text-sm font-medium text-gray-700">
                    Obrazovka
                  </label>
                  <select
                    id="screen"
                    value={formData.screen || ''}
                    onChange={(e) => handleInputChange('screen', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Žiadne (len notifikácia)</option>
                    <option value="home">🏠 Domov</option>
                    <option value="lectio">📖 Lectio Divina</option>
                    <option value="rosary">📿 Ruženec</option>
                    <option value="article">📰 Článok/Správa</option>
                    <option value="program">📅 Program</option>
                    <option value="calendar">📆 Kalendár</option>
                    <option value="profile">👤 Profil</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Vyberte cieľovú obrazovku aplikácie
                  </p>
                </div>

                <div>
                  <label htmlFor="screen_params" className="block text-sm font-medium text-gray-700">
                    Parametre (JSON) <span className="text-gray-400 font-normal">- voliteľné</span>
                  </label>
                  <input
                    type="text"
                    id="screen_params"
                    value={formData.screen_params || ''}
                    onChange={(e) => handleInputChange('screen_params', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder='{"articleId":"123"}'
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    JSON objekt s parametrami pre obrazovku
                  </p>
                </div>
              </div>

              {/* Preview box */}
              {formData.screen && formData.screen !== '' && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔗</div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900">
                        Po kliknutí na notifikáciu:
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Aplikácia otvorí obrazovku <strong>{formData.screen}</strong>
                        {formData.screen_params && formData.screen_params.trim() !== '' && (
                          <span> s parametrami: <code className="text-xs bg-blue-100 px-1 py-0.5 rounded">{formData.screen_params}</code></span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Náhľad notifikácie:</h3>
              <div className="bg-white p-3 rounded border shadow-sm max-w-sm">
                {formData.image_url && formData.image_url.trim() && validateImageUrl(formData.image_url) && (
                  <Image
                    src={formData.image_url}
                    alt="Preview"
                    width={400}
                    height={96}
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

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Informácie o notifikáciách</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Pravidelné notifikácie:</strong> Denné citáty, Božie slovo, modlitby</p>
            <p><strong>Príležitostné notifikácie:</strong> Novinky, oznamy, špeciálne udalosti</p>
            <p><strong>Cieľová skupina:</strong> Notifikácia sa odošle všetkým používateľom vybraného jazyka</p>
            <p><strong>Obrázky:</strong> Rich notifikácie s obrázkami zvyšujú engagement o 20-30%</p>
            <p><strong>Formát dát:</strong> Notifikácia obsahuje aj locale pre správne spracovanie v aplikácii</p>
          </div>
        </div>
      </div> {/* container mx-auto px-4 py-8 */}
    </main>
  );
}
