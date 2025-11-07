'use client';

import { Calendar, CreditCard, DollarSign, Filter, Search, TrendingUp, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  tier: string;
  status: string;
  amount: number;
  interval: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

interface Stats {
  total: number;
  active: number;
  cancelled: number;
  revenue: number;
}

const TIER_LABELS: Record<string, string> = {
  free: 'Zadarmo',
  supporter: 'Podporovateľ',
  patron: 'Patron',
  benefactor: 'Dobrodinca',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktívne',
  past_due: 'Po splatnosti',
  canceled: 'Zrušené',
  incomplete: 'Neúplné',
  incomplete_expired: 'Vypršané',
  trialing: 'Skúšobné',
  unpaid: 'Nezaplatené',
};

export default function SubscriptionsAdminPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, cancelled: 0, revenue: 0 });

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/subscriptions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data);
      setFilteredSubscriptions(data);
      
      // Calculate stats
      const active = data.filter((s: Subscription) => s.status === 'active').length;
      const cancelled = data.filter((s: Subscription) => s.cancel_at_period_end).length;
      const revenue = data
        .filter((s: Subscription) => s.status === 'active')
        .reduce((sum: number, s: Subscription) => sum + s.amount, 0);
      
      setStats({
        total: data.length,
        active,
        cancelled,
        revenue,
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      alert('Chyba pri načítavaní predplatných');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Filter subscriptions
  useEffect(() => {
    let filtered = subscriptions;

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.stripe_subscription_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    if (tierFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.tier === tierFilter);
    }

    setFilteredSubscriptions(filtered);
  }, [searchTerm, statusFilter, tierFilter, subscriptions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="text-blue-600" size={32} />
            Predplatné
          </h1>
          <p className="text-gray-600 mt-1">Správa všetkých predplatných</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Celkový počet</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aktívne</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Na zrušenie</p>
              <p className="text-3xl font-bold text-orange-600">{stats.cancelled}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Mesačný príjem</p>
              <p className="text-3xl font-bold text-purple-600">€{stats.revenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Hľadať podľa emailu, mena alebo ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Všetky stavy</option>
              <option value="active">Aktívne</option>
              <option value="past_due">Po splatnosti</option>
              <option value="canceled">Zrušené</option>
              <option value="incomplete">Neúplné</option>
            </select>
          </div>

          {/* Tier Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Všetky úrovne</option>
              <option value="supporter">Podporovateľ</option>
              <option value="patron">Patron</option>
              <option value="benefactor">Dobrodinca</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zákazník
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Úroveň
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Obdobie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Koniec obdobia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stripe ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Žiadne predplatné
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {subscription.user_name || 'Bez mena'}
                        </div>
                        <div className="text-sm text-gray-500">{subscription.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {TIER_LABELS[subscription.tier] || subscription.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        €{subscription.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.interval === 'month' ? '/mesiac' : '/rok'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          subscription.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : subscription.status === 'past_due'
                            ? 'bg-yellow-100 text-yellow-800'
                            : subscription.status === 'canceled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS_LABELS[subscription.status] || subscription.status}
                      </span>
                      {subscription.cancel_at_period_end && (
                        <div className="text-xs text-orange-600 mt-1">Na zrušenie</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(subscription.current_period_start).toLocaleDateString('sk-SK')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(subscription.current_period_end).toLocaleDateString('sk-SK')}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {subscription.stripe_subscription_id.substring(0, 20)}...
                      </code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="text-center text-sm text-gray-600">
        Zobrazených {filteredSubscriptions.length} z {subscriptions.length} predplatných
      </div>
    </div>
  );
}
