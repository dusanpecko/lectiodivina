'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  description: string;
  category: string;
  subject_sk: string;
  subject_en: string;
  subject_cz: string;
  subject_es: string;
  body_sk: string;
  body_en: string;
  body_cz: string;
  body_es: string;
  available_variables: string[];
  from_email: string;
  from_name: string;
  reply_to: string;
  is_active: boolean;
}

export default function EditEmailTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'sk' | 'en' | 'cz' | 'es'>('sk');
  const [previewHtml, setPreviewHtml] = useState(false);

  const fetchTemplate = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`);
      const data = await response.json();

      if (response.ok) {
        setTemplate(data.template);
      } else {
        alert('Chyba pri načítaní šablóny');
        router.push('/admin/shop/email-templates');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  }, [templateId, router]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleSave = async () => {
    if (!template) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        alert('✅ Šablóna uložená!');
        router.push('/admin/shop/email-templates');
      } else {
        alert('❌ Chyba pri ukladaní šablóny');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('❌ Chyba pri ukladaní šablóny');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof EmailTemplate, value: string | boolean | string[]) => {
    if (!template) return;
    setTemplate({ ...template, [field]: value });
  };

  if (loading || !template) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/admin/shop/email-templates')}
              className="text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              ← Späť na zoznam
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {template.name}
            </h1>
            <p className="text-gray-600 mt-1">{template.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={template.is_active}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Aktívna</span>
            </label>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#40467b] text-white rounded-lg hover:bg-[#33395f] disabled:opacity-50"
            >
              {saving ? 'Ukladám...' : '💾 Uložiť'}
            </button>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              {[
                { key: 'sk', label: '🇸🇰 Slovensky' },
                { key: 'en', label: '🇬🇧 English' },
                { key: 'cz', label: '🇨🇿 Česky' },
                { key: 'es', label: '🇪🇸 Español' },
              ].map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => setActiveTab(lang.key as 'sk' | 'en' | 'cz' | 'es')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === lang.key
                      ? 'border-[#40467b] text-[#40467b]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Subject */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Predmet emailu
              </label>
              <input
                type="text"
                value={template[`subject_${activeTab}` as keyof EmailTemplate] as string || ''}
                onChange={(e) =>
                  updateField(`subject_${activeTab}` as keyof EmailTemplate, e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-transparent"
                placeholder="Zadaj predmet emailu..."
              />
            </div>

            {/* Body */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Obsah emailu
                </label>
                <button
                  onClick={() => setPreviewHtml(!previewHtml)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {previewHtml ? '📝 Editovať' : '👁 Náhľad'}
                </button>
              </div>

              {previewHtml ? (
                <div
                  className="w-full min-h-[400px] px-4 py-3 border border-gray-300 rounded-lg bg-white prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: (template[`body_${activeTab}` as keyof EmailTemplate] as string) || '',
                  }}
                />
              ) : (
                <textarea
                  value={(template[`body_${activeTab}` as keyof EmailTemplate] as string) || ''}
                  onChange={(e) =>
                    updateField(`body_${activeTab}` as keyof EmailTemplate, e.target.value)
                  }
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-transparent font-mono text-sm"
                  placeholder="Zadaj HTML obsah emailu..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Available Variables */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            📋 Dostupné premenné
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {template.available_variables.map((variable: string) => (
              <div
                key={variable}
                className="bg-gray-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  navigator.clipboard.writeText(variable);
                  alert(`📋 Skopírované: ${variable}`);
                }}
              >
                <code className="text-sm text-blue-600">{variable}</code>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 Klikni na premennú pre skopírovanie
          </p>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">⚙️ Nastavenia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={template.from_email}
                onChange={(e) => updateField('from_email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={template.from_name}
                onChange={(e) => updateField('from_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reply-To (voliteľné)
              </label>
              <input
                type="email"
                value={template.reply_to || ''}
                onChange={(e) => updateField('reply_to', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="support@lectiodivina.org"
              />
            </div>
          </div>
        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => router.push('/admin/shop/email-templates')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Zrušiť
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#40467b] text-white rounded-lg hover:bg-[#33395f] disabled:opacity-50"
          >
            {saving ? 'Ukladám...' : '💾 Uložiť zmeny'}
          </button>
        </div>
      </div>
    </div>
  );
}
