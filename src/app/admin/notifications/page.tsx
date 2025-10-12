//src/app/admin/notifications/page.tsx
"use client";

import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  List,
  Plus,
  RefreshCw, Send,
  Trash2,
  X,
  XCircle
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface NotificationStats {
  total_sent: number;
  by_locale: Record<string, { count: number; name: string }>;
  by_topic: Record<string, number>;
  by_date: Record<string, number>;
}

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  locale_name: string;
  topic_name: string; // Názov témy (name_sk)
  topic_id: string; // UUID témy
  scheduled_at: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  topic_name: string; // Názov témy
  fcm_message_id: string;
  subscriber_count: number;
  image_url?: string;
  created_at: string;
  locale_name: string;
  locale_code: string;
}

type NotificationType = 'success' | 'error' | 'info';

// Notification komponenta
const Notification = ({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: NotificationType; 
  onClose: () => void; 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-gray-50 border-gray-200',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-gray-50 border-gray-200'
  }[type];
  
  const textColor = {
    success: { color: '#40467b' },
    error: {},
    info: { color: '#40467b' }
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg p-4 shadow-lg ${bgColor} max-w-md`} style={textColor}>
      <div className="flex items-start gap-3">
        <Icon size={20} />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Loading komponenta
const LoadingSpinner = ({ size = 6 }: { size?: number }) => (
  <div className={`w-${size} h-${size} border-2 border-t-transparent rounded-full animate-spin`} style={{ borderColor: '#40467b', borderTopColor: 'transparent' }} />
);

export default function NotificationsPage() {
  const router = useRouter();
  
  // State
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);
  


  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; log: NotificationLog | null }>({
    isOpen: false,
    log: null
  });
  const [securityCode, setSecurityCode] = useState('');



  // Notifikácie helper
  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  const statusNames: Record<string, string> = {
    pending: 'Čaká',
    sent: 'Odoslané',
    failed: 'Zlyhalo',
    cancelled: 'Zrušené'
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token';

      const statsResponse = await fetch(`/api/admin/notification-stats?start=${dateRange.start}&end=${dateRange.end}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        showNotification('Chyba pri načítavaní štatistík.', 'error');
      }

      const scheduledResponse = await fetch('/api/admin/scheduled-notifications', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (scheduledResponse.ok) {
        const scheduledData = await scheduledResponse.json();
        setScheduledNotifications(scheduledData);
      } else {
        showNotification('Chyba pri načítavaní naplánovaných notifikácií.', 'error');
      }

      const logsResponse = await fetch('/api/admin/notification-logs?limit=50', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setNotificationLogs(logsData.logs || []);
        setLogsTotal(logsData.total || 0);
      } else {
        showNotification('Chyba pri načítavaní odoslaných notifikácií.', 'error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Nepodarilo sa pripojiť k serveru.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.start, dateRange.end, showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cancelScheduledNotification = useCallback(async (id: string) => {
    if (!window.confirm('Naozaj chcete zrušiť túto notifikáciu?')) {
      return;
    }
    
    setDeletingId(id);
    
    try {
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token';
      const response = await fetch(`/api/admin/scheduled-notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (response.ok) {
        showNotification('Notifikácia bola úspešne zrušená.', 'success');
        fetchData();
      } else {
        showNotification('Chyba pri rušení notifikácie.', 'error');
      }
    } catch {
      showNotification('Chyba pri rušení notifikácie.', 'error');
    } finally {
      setDeletingId(null);
    }
  }, [showNotification, fetchData]);

  const handleDeleteLog = useCallback(async () => {
    if (!deleteDialog.log) return;

    // Overenie prebieha na serveri, nie tu
    if (!securityCode || securityCode.length < 4) {
      showNotification('Zadajte bezpečnostný kód!', 'error');
      return;
    }

    try {
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token';
      const response = await fetch('/api/admin/notification-logs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ 
          id: deleteDialog.log.id,
          securityCode 
        })
      });

      const result = await response.json();

      if (response.ok) {
        showNotification('Notifikácia bola úspešne vymazaná.', 'success');
        setDeleteDialog({ isOpen: false, log: null });
        setSecurityCode('');
        fetchData();
      } else {
        showNotification(result.error || 'Chyba pri mazaní notifikácie.', 'error');
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      showNotification('Chyba pri mazaní notifikácie.', 'error');
    }
  }, [deleteDialog.log, securityCode, showNotification, fetchData]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('sk-SK');

  return (
    <div className="min-h-screen">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Bell size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    Správa Notifikácií
                  </h1>
                  <p className="text-indigo-100 mt-1">Prehľad a analýza push notifikácií</p>
                </div>
              </div>
              
              {/* Štatistiky */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{stats.total_sent}</div>
                    <div className="text-sm text-indigo-100 mt-1">Odoslané</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">
                      {Object.keys(stats.by_locale).length}
                    </div>
                    <div className="text-sm text-indigo-100 mt-1">Jazyky</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">
                      {Object.keys(stats.by_topic).length}
                    </div>
                    <div className="text-sm text-indigo-100 mt-1">Témy</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">
                      {scheduledNotifications.filter(n => n.status === 'pending').length}
                    </div>
                    <div className="text-sm text-indigo-100 mt-1">Naplánované</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Ovládacie panely */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Akcie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Send size={20} style={{ color: '#40467b' }} />
              </div>
              <h3 className="font-semibold text-gray-800">Akcie</h3>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  localStorage.setItem('admin-notifications-page', '/admin/notifications');
                  router.push('/admin/notifications/new');
                }}
                className="w-full bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white px-4 py-2.5 rounded-lg hover:from-[#686ea3] hover:to-[#40467b] transition flex items-center justify-center gap-2 shadow-sm font-medium"
              >
                <Plus size={16} />
                Nová notifikácia
              </button>
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2.5 rounded-lg hover:from-gray-700 hover:to-gray-800 transition text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner size={4} /> : <RefreshCw size={16} />}
                {isLoading ? "Načítavam..." : "Obnoviť údaje"}
              </button>
            </div>
          </div>

          {/* Časový filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Časové obdobie</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Od
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent transition"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Do
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent transition"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                />
              </div>
            </div>
          </div>

          {/* Detailné štatistiky */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Prehľad</h3>
            </div>
            {stats && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-cyan-800 text-xs">📤</span>
                  </div>
                  <div className="font-bold text-cyan-800">{stats.total_sent}</div>
                  <div className="text-xs text-gray-500">Odoslané</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-purple-800 text-xs">⏰</span>
                  </div>
                  <div className="font-bold text-purple-800">
                    {scheduledNotifications.filter(n => n.status === 'pending').length}
                  </div>
                  <div className="text-xs text-gray-500">Naplánované</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-orange-800 text-xs">🌐</span>
                  </div>
                  <div className="font-bold text-orange-800">{Object.keys(stats.by_locale).length}</div>
                  <div className="text-xs text-gray-500">Jazyky</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-green-800 text-xs">📋</span>
                  </div>
                  <div className="font-bold text-green-800">{Object.keys(stats.by_topic).length}</div>
                  <div className="text-xs text-gray-500">Témy</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Štatistiky podľa jazyka a témy */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Podľa jazykov</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(stats.by_locale).map(([locale, data]) => (
                  <div key={locale} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <span className="text-sm font-medium text-gray-700">{data.name}</span>
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-sm font-bold text-blue-800">
                      {data.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 size={20} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Podľa témy</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(stats.by_topic).map(([topic, count]) => (
                  <div key={topic} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <span className="text-sm font-medium text-gray-700">{topic}</span>
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full text-sm font-bold text-green-800">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Naplánované notifikácie */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Naplánované notifikácie ({scheduledNotifications.length})
              </h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Bell size={16} />
                      Notifikácia
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      Jazyk/Téma
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      Naplánované
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Akcie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <LoadingSpinner />
                        <span className="text-gray-500">Načítavam...</span>
                      </div>
                    </td>
                  </tr>
                ) : scheduledNotifications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Žiadne naplánované notifikácie</p>
                        <p>Všetky notifikácie boli odoslané alebo zrušené</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  scheduledNotifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{notification.body}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {notification.locale_name}
                          </span>
                          <span className="text-sm text-gray-500">{notification.topic_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(notification.scheduled_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statusColors[notification.status]}`}>
                          {notification.status === 'sent' && <CheckCircle size={12} />}
                          {notification.status === 'failed' && <XCircle size={12} />}
                          {notification.status === 'pending' && <Clock size={12} />}
                          {notification.status === 'cancelled' && <AlertCircle size={12} />}
                          {statusNames[notification.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {notification.status === 'pending' && (
                          <button
                            onClick={() => cancelScheduledNotification(notification.id)}
                            disabled={deletingId === notification.id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                            title="Zrušiť"
                          >
                            {deletingId === notification.id ? (
                              <LoadingSpinner size={4} />
                            ) : (
                              <X size={18} />
                            )}
                          </button>
                        )}
                        {notification.status === 'failed' && notification.error_message && (
                          <span className="p-2 text-red-600 cursor-help" title={notification.error_message}>
                            <AlertCircle size={18} />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* História odoslaných notifikácií */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <List size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                História odoslaných notifikácií ({logsTotal})
              </h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Bell size={16} />
                      Notifikácia
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      Jazyk/Téma
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      Odoslaná
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} />
                      Príjemcovia
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Akcie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <LoadingSpinner />
                        <span className="text-gray-500">Načítavam...</span>
                      </div>
                    </td>
                  </tr>
                ) : notificationLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <List size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Žiadne odoslané notifikácie</p>
                        <p>História notifikácií sa zobrazí po ich odoslaní</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  notificationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{log.body}</div>
                          {log.image_url && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-2">
                              <span>📷</span>
                              S obrázkom
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                            {log.locale_name}
                          </span>
                          <span className="text-sm text-gray-500">{log.topic_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle size={14} className="text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{log.subscriber_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, log })}
                          disabled={deletingId === log.id}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          title="Vymazať"
                        >
                          {deletingId === log.id ? (
                            <LoadingSpinner size={4} />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Dialog */}
        {deleteDialog.isOpen && deleteDialog.log && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Vymazať notifikáciu</h3>
                  <p className="text-sm text-gray-500">Táto akcia je nevratná</p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-1">{deleteDialog.log.title}</div>
                <div className="text-sm text-gray-600">{deleteDialog.log.body}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {deleteDialog.log.locale_name} • {deleteDialog.log.topic_name} • {deleteDialog.log.subscriber_count} príjemcov
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="securityCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Zadajte bezpečnostný kód na potvrdenie
                </label>
                <input
                  id="securityCode"
                  type="password"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="••••••"
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                  Pre vymazanie je potrebný tajný bezpečnostný kód
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteDialog({ isOpen: false, log: null });
                    setSecurityCode('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Zrušiť
                </button>
                <button
                  onClick={handleDeleteLog}
                  disabled={!securityCode || securityCode.length < 4}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Vymazať
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
