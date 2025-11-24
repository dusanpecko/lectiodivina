'use client';

import { Calendar, DollarSign, Heart, Search, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Donation {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  message: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface Stats {
  total: number;
  totalAmount: number;
  thisMonth: number;
  thisMonthAmount: number;
}

export default function DonationsAdminPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalAmount: 0,
    thisMonth: 0,
    thisMonthAmount: 0,
  });

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/donations');

      if (!response.ok) {
        throw new Error('Failed to fetch donations');
      }

      const data = await response.json();
      setDonations(data);
      setFilteredDonations(data);

      // Calculate stats
      const totalAmount = data.reduce((sum: number, d: Donation) => sum + d.amount, 0);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthDonations = data.filter(
        (d: Donation) => new Date(d.created_at) >= firstDayOfMonth
      );
      const thisMonthAmount = thisMonthDonations.reduce(
        (sum: number, d: Donation) => sum + d.amount,
        0
      );

      setStats({
        total: data.length,
        totalAmount,
        thisMonth: thisMonthDonations.length,
        thisMonthAmount,
      });
    } catch (error) {
      console.error('Error fetching donations:', error);
      alert('Chyba pri načítavaní darov');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Filter donations
  useEffect(() => {
    let filtered = donations;

    if (searchTerm) {
      filtered = filtered.filter(
        (donation) =>
          donation.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.stripe_payment_intent_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDonations(filtered);
  }, [searchTerm, donations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="text-red-600" size={32} />
            Dary
          </h1>
          <p className="text-gray-600 mt-1">Prehľad všetkých jednorazových príspevkov</p>
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
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Celková suma</p>
              <p className="text-3xl font-bold text-red-600">€{stats.totalAmount.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <DollarSign className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tento mesiac</p>
              <p className="text-3xl font-bold text-orange-600">{stats.thisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tento mesiac suma</p>
              <p className="text-3xl font-bold text-green-600">
                €{stats.thisMonthAmount.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Hľadať podľa emailu, mena, správy alebo ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Donations List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Darca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Správa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dátum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stripe ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Žiadne dary
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {donation.user_name || donation.user_email || 'Anonymný'}
                        </div>
                        {donation.user_name && donation.user_email && (
                          <div className="text-sm text-gray-500">{donation.user_email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-xl text-red-600">
                        €{donation.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {donation.message ? (
                        <div className="text-sm text-gray-700 italic max-w-md">
                          &quot;{donation.message}&quot;
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Bez správy</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{new Date(donation.created_at).toLocaleDateString('sk-SK')}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(donation.created_at).toLocaleTimeString('sk-SK')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {donation.stripe_payment_intent_id ? (
                        <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {donation.stripe_payment_intent_id.substring(0, 20)}...
                        </code>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
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
        Zobrazených {filteredDonations.length} z {donations.length} darov
      </div>
    </div>
  );
}
