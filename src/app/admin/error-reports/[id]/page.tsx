'use client';

import { useSupabase } from '@/app/components/SupabaseProvider';
import { AlertCircle, ArrowLeft, Ban, Calendar, Check, Eye, Save, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface ErrorReport {
  id: number;
  created_at: string;
  user_email: string;
  lectio_date: string;
  step_key: string;
  step_name: string;
  original_text: string;
  corrected_text: string;
  error_severity: 'low' | 'medium' | 'high' | 'critical';
  additional_notes: string | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
}

const severityConfig = {
  low: { label: 'Malá chyba', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  medium: { label: 'Gramatika', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  high: { label: 'Význam', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  critical: { label: 'Kritická', color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.1)' }
};

const statusConfig = {
  pending: { label: 'Čaká', color: '#6b7280', icon: AlertCircle },
  reviewed: { label: 'Skontrolované', color: '#3b82f6', icon: Eye },
  accepted: { label: 'Akceptované', color: '#10b981', icon: Check },
  rejected: { label: 'Zamietnuté', color: '#ef4444', icon: Ban }
};

export default function ErrorReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const [report, setReport] = useState<ErrorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'pending' | 'reviewed' | 'accepted' | 'rejected'>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reportId, setReportId] = useState<string>('');

  useEffect(() => {
    params.then(p => {
      setReportId(p.id);
    });
  }, [params]);

  const fetchReport = useCallback(async () => {
    if (!reportId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('error_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;
      
      setReport(data);
      setStatus(data.status);
      setAdminNotes(data.admin_notes || '');
    } catch (error) {
      console.error('Error fetching report:', error);
      router.push('/admin/error-reports');
    } finally {
      setLoading(false);
    }
  }, [reportId, supabase, router]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleSave = async () => {
    if (!report || !session) return;

    try {
      setSaving(true);
      
      const updateData: Partial<ErrorReport> = {
        status,
        admin_notes: adminNotes || null,
      };

      // If status changed to reviewed/accepted/rejected, add timestamp and reviewer
      if (status !== 'pending' && report.status === 'pending') {
        updateData.reviewed_at = new Date().toISOString();
        updateData.reviewed_by = session.user.id;
      }

      const { error } = await supabase
        .from('error_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Refresh data
      await fetchReport();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Nepodarilo sa uložiť zmeny. Skúste to prosím znova.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ 
              borderColor: 'rgba(64, 70, 123, 0.2)',
              borderTopColor: '#40467b'
            }}
          />
          <p className="text-gray-600">Načítavam detail...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/admin/error-reports')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-80 font-medium"
            style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)', color: '#40467b' }}
          >
            <ArrowLeft size={20} />
            Späť na zoznam
          </button>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg animate-fade-in" style={{ backgroundColor: '#d1fae5' }}>
                <Check size={16} style={{ color: '#065f46' }} />
                <span className="text-sm font-medium" style={{ color: '#065f46' }}>
                  Zmeny uložené
                </span>
              </div>
            )}
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-80 disabled:opacity-50 shadow-md"
              style={{ backgroundColor: '#40467b' }}
            >
              <Save size={20} />
              {saving ? 'Ukladám...' : 'Uložiť zmeny'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">ID hlásenia</div>
            <div className="text-lg font-bold" style={{ color: '#40467b' }}>#{report.id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Dátum vytvorenia</div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar size={16} />
              {formatDate(report.created_at)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Používateľ</div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User size={16} />
              {report.user_email}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Report Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lectio Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#40467b' }}>
              Informácie o Lectio Divina
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Dátum lectio</div>
                <div className="text-base font-medium text-gray-900">
                  {new Date(report.lectio_date).toLocaleDateString('sk-SK', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Krok</div>
                <div className="text-base font-bold" style={{ color: '#40467b' }}>
                  {report.step_name}
                </div>
              </div>
            </div>
          </div>

          {/* Text Comparison */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#40467b' }}>
              Porovnanie textov
            </h2>
            
            {/* Original Text */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <X size={18} style={{ color: '#ef4444' }} />
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#ef4444' }}>
                  Pôvodný text (s chybou)
                </h3>
              </div>
              <div 
                className="p-4 rounded-lg border-2"
                style={{ 
                  borderColor: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)'
                }}
              >
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {report.original_text}
                </p>
              </div>
            </div>

            {/* Corrected Text */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Check size={18} style={{ color: '#10b981' }} />
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#10b981' }}>
                  Opravený text
                </h3>
              </div>
              <div 
                className="p-4 rounded-lg border-2"
                style={{ 
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)'
                }}
              >
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {report.corrected_text}
                </p>
              </div>
            </div>
          </div>

          {/* User Notes */}
          {report.additional_notes && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#40467b' }}>
                Poznámky používateľa
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {report.additional_notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Status & Admin Actions */}
        <div className="space-y-6">
          {/* Severity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#40467b' }}>
              Závažnosť
            </h3>
            <div 
              className="px-4 py-3 rounded-lg text-center font-semibold"
              style={{
                color: severityConfig[report.error_severity].color,
                backgroundColor: severityConfig[report.error_severity].bgColor
              }}
            >
              {severityConfig[report.error_severity].label}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#40467b' }}>
              Stav hlásenia
            </h3>
            <div className="space-y-2">
              {Object.entries(statusConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setStatus(key as 'pending' | 'reviewed' | 'accepted' | 'rejected')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      status === key ? 'shadow-md' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: status === key ? config.color : `${config.color}20`,
                      color: status === key ? 'white' : config.color,
                    }}
                  >
                    <Icon size={20} />
                    <span className="font-semibold">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#40467b' }}>
              Admin poznámky
            </h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Pridajte interné poznámky (voliteľné)..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#40467b] resize-none"
              style={{ 
                borderColor: 'rgba(64, 70, 123, 0.2)',
                backgroundColor: 'rgba(64, 70, 123, 0.03)'
              }}
            />
          </div>

          {/* Review Info */}
          {report.reviewed_at && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#40467b' }}>
                Informácie o kontrole
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Skontrolované:</span>
                  <div className="font-medium text-gray-900 mt-1">
                    {formatDate(report.reviewed_at)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
