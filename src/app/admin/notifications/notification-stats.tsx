//src/app/admin/notifications/notification-stats.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  topic: string;
  scheduled_at: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

export default function NotificationStats() {
  const router = useRouter();
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const topicNames: Record<string, string> = {
    regular: 'Pravidelné',
    occasional: 'Príležitostné'
  };

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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start, dateRange.end]);

  const fetchData = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token';

      const statsResponse = await fetch(`/api/admin/notification-stats?start=${dateRange.start}&end=${dateRange.end}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        setMessage({ type: 'error', text: 'Chyba pri načítavaní štatistík.' });
      }

      const scheduledResponse = await fetch('/api/admin/scheduled-notifications', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (scheduledResponse.ok) {
        const scheduledData = await scheduledResponse.json();
        setScheduledNotifications(scheduledData);
      } else {
        setMessage({ type: 'error', text: 'Chyba pri načítavaní naplánovaných notifikácií.' });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Nepodarilo sa pripojiť k serveru.' });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelScheduledNotification = async (id: string) => {
    if (!window.confirm('Naozaj chcete zrušiť túto notifikáciu?')) {
      return;
    }
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
        setMessage({ type: 'success', text: 'Notifikácia bola úspešne zrušená.' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Chyba pri rušení notifikácie.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Chyba pri rušení notifikácie.' });
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('sk-SK');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam štatistiky...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Štatistiky notifikácií</h1>
            <p className="text-gray-600 mt-2">Prehľad odoslaných a naplánovaných notifikácií</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin/notifications')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Nová notifikácia
            </button>
            <button
              onClick={fetchData}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Obnoviť
            </button>
          </div>
        </div>
        {message && (
          <div
            className={`p-4 rounded-md mb-4 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Date Range Filter */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Časové obdobie</h3>
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Od</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Do</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.total_sent}</div>
              <div className="text-sm text-gray-500">Celkom odoslaných</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(stats.by_topic).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-sm text-gray-500">Všetky témy</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.by_locale).length}
              </div>
              <div className="text-sm text-gray-500">Aktívne jazyky</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">
                {scheduledNotifications.filter(n => n.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">Naplánované</div>
            </div>
          </div>
        )}

        {/* Statistics Lists */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Podľa jazykov</h3>
              <div className="space-y-3">
                {Object.entries(stats.by_locale).map(([locale, data]) => (
                  <div key={locale} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{data.name}</span>
                    <span className="text-sm font-medium">{data.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Podľa témy</h3>
              <div className="space-y-3">
                {Object.entries(stats.by_topic).map(([topic, count]) => (
                  <div key={topic} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{topicNames[topic] || topic}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Notifications */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Naplánované notifikácie</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notifikácia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jazyk/Téma</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naplánované</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcie</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scheduledNotifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{notification.body}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{notification.locale_name}</div>
                      <div className="text-sm text-gray-500">{topicNames[notification.topic]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(notification.scheduled_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[notification.status]}`}>
                        {statusNames[notification.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {notification.status === 'pending' && (
                        <button
                          onClick={() => cancelScheduledNotification(notification.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Zrušiť
                        </button>
                      )}
                      {notification.status === 'failed' && notification.error_message && (
                        <span className="text-red-600" title={notification.error_message}>
                          Chyba
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {scheduledNotifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">Žiadne naplánované notifikácie</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
