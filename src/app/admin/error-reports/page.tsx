'use client';

import BetaFeedbackList from '@/app/components/BetaFeedbackList';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Eye, Filter, MessageSquare, Search, User } from 'lucide-react';
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
  pending: { label: 'Čaká', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
  reviewed: { label: 'Skontrolované', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  accepted: { label: 'Akceptované', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  rejected: { label: 'Zamietnuté', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
};

export default function ErrorReportsPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'error-reports' | 'beta-feedback'>('error-reports');
  const [betaStats, setBetaStats] = useState({ total: 0, resolved: 0, unresolved: 0 });
  const itemsPerPage = 20;

  const fetchBetaStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/beta-feedback');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const data = result.data || [];
      const total = data.length;
      const resolved = data.filter((item: { resolved: boolean; status?: string }) => 
        item.resolved === true || item.status === 'resolved'
      ).length;
      const unresolved = total - resolved;

      setBetaStats({ total, resolved, unresolved });
    } catch (error) {
      console.error('Error fetching beta stats:', error);
      setBetaStats({ total: 0, resolved: 0, unresolved: 0 });
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('error_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchReports();
    fetchBetaStats();
  }, [fetchReports, fetchBetaStats]);

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || report.error_severity === filterSeverity;
    const matchesSearch = searchQuery === '' || 
      report.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.step_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.original_text.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  // Statistics
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    accepted: reports.filter(r => r.status === 'accepted').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
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
          <p className="text-gray-600">Načítavam hlásenia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  {activeTab === 'error-reports' ? <AlertCircle size={28} className="text-white" /> : <MessageSquare size={28} className="text-white" />}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    {activeTab === 'error-reports' ? 'Správa hlásení chýb' : 'Beta Feedback'}
                  </h1>
                  <p className="text-indigo-100 mt-1">
                    {activeTab === 'error-reports' ? 'Opravy a hlásenia od používateľov' : 'Zpětná vazba z beta verzie'}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6">
                <button
                  onClick={() => setActiveTab('error-reports')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'error-reports'
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'bg-white/10 text-indigo-200 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>Error Reports</span>
                    {stats.pending > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === 'error-reports' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-orange-400 text-white'
                      }`}>
                        {stats.pending}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('beta-feedback')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'beta-feedback'
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'bg-white/10 text-indigo-200 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={20} />
                    <span>Beta Feedback</span>
                    {betaStats.unresolved > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === 'beta-feedback' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-400 text-white'
                      }`}>
                        {betaStats.unresolved}
                      </span>
                    )}
                  </div>
                </button>
              </div>
              
              {/* Štatistiky - iba pre error reports */}
              {activeTab === 'error-reports' && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{stats.total}</div>
                    <div className="text-sm text-indigo-100 mt-1">Celkovo</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{stats.pending}</div>
                    <div className="text-sm text-indigo-100 mt-1">Čaká</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{stats.reviewed}</div>
                    <div className="text-sm text-indigo-100 mt-1">Skontrolované</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{stats.accepted}</div>
                    <div className="text-sm text-indigo-100 mt-1">Akceptované</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{stats.rejected}</div>
                    <div className="text-sm text-indigo-100 mt-1">Zamietnuté</div>
                  </div>
                </div>
              )}

              {/* Beta Feedback štatistiky */}
              {activeTab === 'beta-feedback' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{betaStats.total}</div>
                    <div className="text-sm text-indigo-100 mt-1">Celkovo</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{betaStats.unresolved}</div>
                    <div className="text-sm text-indigo-100 mt-1">Nové</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{betaStats.resolved}</div>
                    <div className="text-sm text-indigo-100 mt-1">Vyriešené</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Content */}
        {activeTab === 'error-reports' && (
          <>
            {/* Vyhľadávanie a filtre */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Search size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">Vyhľadávanie a filtre</h3>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Hľadať podľa emailu, kroku alebo textu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-600" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    <option value="all">Všetky stavy</option>
                    <option value="pending">Čaká</option>
                    <option value="reviewed">Skontrolované</option>
                    <option value="accepted">Akceptované</option>
                    <option value="rejected">Zamietnuté</option>
                  </select>
                </div>

                {/* Severity Filter */}
                <div>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    <option value="all">Všetky závažnosti</option>
                    <option value="low">Malá chyba</option>
                    <option value="medium">Gramatika</option>
                    <option value="high">Význam</option>
                    <option value="critical">Kritická</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
              {currentReports.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Žiadne hlásenia</h3>
                  <p className="text-gray-600">Zatiaľ nie sú žiadne error reports podľa vašich filtrov.</p>
                </div>
              ) : (
                currentReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-2">
                            <span
                              className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                color: severityConfig[report.error_severity].color,
                                backgroundColor: severityConfig[report.error_severity].bgColor
                              }}
                            >
                              {severityConfig[report.error_severity].label}
                            </span>
                            <span
                              className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                color: statusConfig[report.status].color,
                                backgroundColor: statusConfig[report.status].bgColor
                              }}
                            >
                              {statusConfig[report.status].label}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Calendar size={16} />
                              {formatDate(report.created_at)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User size={16} />
                              {report.user_email}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/admin/error-reports/${report.id}`)}
                          className="p-2 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 transition-all hover:shadow-md hover:scale-105"
                        >
                          <Eye size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Pôvodný text:</h4>
                          <p className="text-gray-700 bg-red-50 rounded-lg p-3 border-l-4 border-red-300">
                            {report.original_text}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Opravený text:</h4>
                          <p className="text-gray-700 bg-green-50 rounded-lg p-3 border-l-4 border-green-300">
                            {report.corrected_text}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span><strong>Krok:</strong> {report.step_name}</span>
                        <span><strong>Dátum lectio:</strong> {report.lectio_date}</span>
                      </div>

                      {report.additional_notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Dodatočné poznámky:</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            {report.additional_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md hover:scale-105"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-indigo-600">
                  Strana {currentPage} z {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md hover:scale-105"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Beta Feedback Content */}
        {activeTab === 'beta-feedback' && (
          <BetaFeedbackList onStatsChange={(stats) => {
            setBetaStats(stats);
            // Also refresh our local stats
            fetchBetaStats();
          }} />
        )}
      </div>
    </div>
  );
}