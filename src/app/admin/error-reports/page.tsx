'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, Calendar, User, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
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
  };

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
                  <AlertCircle size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    Správa hlásení chýb
                  </h1>
                  <p className="text-indigo-100 mt-1">Opravy a hlásenia od používateľov</p>
                </div>
              </div>
              
              {/* Štatistiky */}
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
            </div>
          </div>
        </header>

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
              <option value="critical">Kritická</option>
              <option value="high">Význam</option>
              <option value="medium">Gramatika</option>
              <option value="low">Malá chyba</option>
            </select>
          </div>
        </div>
      </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Dátum vytvorenia</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Používateľ</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Lectio dátum</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Krok</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Závažnosť</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Stav</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Akcie</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Žiadne hlásenia nenájdené
                    </td>
                  </tr>
                ) : (
                  currentReports.map((report) => (
                    <tr 
                      key={report.id} 
                      className={`transition-all duration-200 ${
                        report.status === 'pending' 
                          ? 'bg-red-50 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-50' 
                          : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-600" />
                          {formatDate(report.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-600" />
                          {report.user_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(report.lectio_date).toLocaleDateString('sk-SK')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={report.status === 'pending' ? 'font-medium text-red-600' : 'font-medium text-indigo-600'}>
                          {report.step_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            color: severityConfig[report.error_severity].color,
                            backgroundColor: severityConfig[report.error_severity].bgColor
                          }}
                        >
                          {severityConfig[report.error_severity].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            color: statusConfig[report.status].color,
                            backgroundColor: statusConfig[report.status].bgColor
                          }}
                      >
                          {statusConfig[report.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/admin/error-reports/${report.id}`)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg hover:scale-105 ${
                            report.status === 'pending'
                              ? 'bg-gradient-to-r from-red-600 to-red-700'
                              : 'bg-gradient-to-r from-[#40467b] to-[#5a5f8f]'
                          }`}
                        >
                          <Eye size={16} />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Zobrazené {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} z {filteredReports.length} záznamov
              </div>
              <div className="flex items-center gap-2">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
