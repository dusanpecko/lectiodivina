'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  description: string;
  category: string;
  subject_sk: string;
  body_sk: string;
  is_active: boolean;
  sent_count: number;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchTemplates = useCallback(async () => {
    try {
      const url =
        selectedCategory === 'all'
          ? '/api/admin/email-templates'
          : `/api/admin/email-templates?category=${selectedCategory}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'order':
        return 'bg-blue-100 text-blue-800';
      case 'subscription':
        return 'bg-purple-100 text-purple-800';
      case 'donation':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'order':
        return '📦';
      case 'subscription':
        return '💜';
      case 'donation':
        return '💝';
      default:
        return '📧';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 Email Šablóny
          </h1>
          <p className="text-gray-600">
            Upravuj texty emailov bez programovania. Podporované premenné:
            {'{{customer_name}}'}, {'{{order_number}}'}, atď.
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Kategória:
            </label>
            <div className="flex gap-2">
              {['all', 'order', 'subscription', 'donation'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#40467b] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' && '📋 Všetky'}
                  {cat === 'order' && '📦 Objednávky'}
                  {cat === 'subscription' && '💜 Predplatné'}
                  {cat === 'donation' && '💝 Dary'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
              onClick={() =>
                router.push(`/admin/shop/email-templates/edit/${template.id}`)
              }
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {getCategoryIcon(template.category)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getCategoryColor(
                        template.category
                      )}`}
                    >
                      {template.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {template.is_active ? (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  ) : (
                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                {template.description}
              </p>

              {/* Subject Preview */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Predmet (SK):</p>
                <p className="text-sm text-gray-900 line-clamp-2">
                  {template.subject_sk}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Odoslaných: {template.sent_count}</span>
                {template.last_sent_at && (
                  <span>
                    Posledný:{' '}
                    {new Date(template.last_sent_at).toLocaleDateString('sk')}
                  </span>
                )}
              </div>

              {/* Template Key */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <code className="text-xs text-gray-400">
                  {template.template_key}
                </code>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Žiadne šablóny
            </h3>
            <p className="text-gray-600">
              {selectedCategory === 'all'
                ? 'Zatiaľ nie sú vytvorené žiadne email šablóny.'
                : `Žiadne šablóny v kategórii "${selectedCategory}".`}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Ako používať premenné
          </h3>
          <p className="text-blue-800 text-sm mb-3">
            V textoch emailov môžeš použiť premenné v tvare {'{{premenna}}'}.
            Systém ich automaticky nahradí skutočnými hodnotami.
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-white rounded p-2">
              <code className="text-blue-600">{'{{customer_name}}'}</code>
              <span className="text-gray-600 ml-2">→ Meno zákazníka</span>
            </div>
            <div className="bg-white rounded p-2">
              <code className="text-blue-600">{'{{order_number}}'}</code>
              <span className="text-gray-600 ml-2">→ Číslo objednávky</span>
            </div>
            <div className="bg-white rounded p-2">
              <code className="text-blue-600">{'{{total_amount}}'}</code>
              <span className="text-gray-600 ml-2">→ Celková suma</span>
            </div>
            <div className="bg-white rounded p-2">
              <code className="text-blue-600">{'{{tier_name}}'}</code>
              <span className="text-gray-600 ml-2">→ Názov tieru</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
