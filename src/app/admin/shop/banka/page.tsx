'use client';

import { Banknote, Building2, Calendar, Link as LinkIcon, Search, TrendingUp, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface BankPayment {
  id: string;
  transaction_date: string;
  amount: number;
  currency: string;
  payer_reference: string;
  transaction_type: string;
  counterparty_account: string;
  counterparty_bank: string;
  counterparty_name: string;
  message_for_recipient: string;
  additional_info: string;
  user_id: string | null;
  matched: boolean;
  payment_type?: string | null;
  related_id?: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  variable_symbol: string | null;
}

interface Stats {
  total: number;
  totalAmount: number;
  matched: number;
  unmatched: number;
  thisMonth: number;
  thisMonthAmount: number;
}

export default function BankaAdminPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<BankPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<BankPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatched, setFilterMatched] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalAmount: 0,
    matched: 0,
    unmatched: 0,
    thisMonth: 0,
    thisMonthAmount: 0,
  });

  // Manual matching modal state
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<BankPayment | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'donation' | 'shop' | 'subscription'>('donation');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all payments in batches to handle 1000+ records
      let allPayments: BankPayment[] = [];
      let hasMore = true;
      let offset = 0;
      const batchSize = 1000;

      while (hasMore) {
        const response = await fetch(`/api/admin/bank-payments?limit=${batchSize}&offset=${offset}`);

        if (!response.ok) {
          throw new Error('Failed to fetch bank payments');
        }

        const data = await response.json();
        allPayments = [...allPayments, ...data];
        
        // If we got less than batchSize, we've reached the end
        hasMore = data.length === batchSize;
        offset += batchSize;
      }

      setPayments(allPayments);
      setFilteredPayments(allPayments);
      setTotalPages(Math.ceil(allPayments.length / pageSize));

      // Calculate stats
      const totalAmount = allPayments.reduce((sum: number, p: BankPayment) => sum + p.amount, 0);
      const matched = allPayments.filter((p: BankPayment) => p.matched);
      const unmatched = allPayments.filter((p: BankPayment) => !p.matched);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthPayments = allPayments.filter(
        (p: BankPayment) => new Date(p.transaction_date) >= firstDayOfMonth
      );
      const thisMonthAmount = thisMonthPayments.reduce(
        (sum: number, p: BankPayment) => sum + p.amount,
        0
      );

      setStats({
        total: allPayments.length,
        totalAmount,
        matched: matched.length,
        unmatched: unmatched.length,
        thisMonth: thisMonthPayments.length,
        thisMonthAmount,
      });
    } catch (error) {
      console.error('Error fetching bank payments:', error);
      alert('Chyba pri načítavaní bankových platieb');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const handleAutoMatch = async () => {
    if (!confirm('Spárovať všetky nespárované platby automaticky podľa variabilného symbolu?')) {
      return;
    }

    try {
      setMatching(true);
      const response = await fetch('/api/admin/bank-payments/match', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to match payments');
      }

      const data = await response.json();
      
      let message = `Úspešne spárovaných: ${data.matched} platieb\nNespárovaných ostáva: ${data.unmatched}`;
      if (data.skipped > 0) {
        message += `\nPreskočených (už spárované): ${data.skipped}`;
      }
      
      alert(message);
      
      // Reload payments
      await fetchPayments();
    } catch (error) {
      console.error('Error matching payments:', error);
      alert('Chyba pri párovaní platieb');
    } finally {
      setMatching(false);
    }
  };

  const searchUsers = async (search: string) => {
    if (search.length < 2) {
      setUsers([]);
      return;
    }

    try {
      setLoadingUsers(true);
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(search)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleManualMatch = async () => {
    if (!selectedPayment || !selectedUser) return;

    try {
      const response = await fetch(`/api/admin/bank-payments/${selectedPayment.id}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          paymentType: selectedPaymentType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to match payment');
      }

      alert('Platba úspešne spárovaná!');
      setShowMatchModal(false);
      setSelectedPayment(null);
      setSelectedUser(null);
      setUserSearchTerm('');
      await fetchPayments();
    } catch (error) {
      console.error('Error matching payment:', error);
      alert('Chyba pri párovaní platby');
    }
  };

  const handleUnmatch = async (paymentId: string) => {
    if (!confirm('Odpárovať túto platbu?')) return;

    try {
      const response = await fetch(`/api/admin/bank-payments/${paymentId}/match`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unmatch payment');
      }

      alert('Platba úspešne odpárovaná!');
      await fetchPayments();
    } catch (error) {
      console.error('Error unmatching payment:', error);
      alert('Chyba pri odpárovaní platby');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Filter payments
  useEffect(() => {
    let filtered = payments;

    if (filterMatched !== 'all') {
      filtered = filtered.filter((p) =>
        filterMatched === 'matched' ? p.matched : !p.matched
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.counterparty_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.message_for_recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.payer_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filterMatched, payments, pageSize]);

  // Search users with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearchTerm) {
        searchUsers(userSearchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getPaymentTypeColor = (type: string | null | undefined) => {
    switch (type) {
      case 'donation':
        return 'bg-pink-100 text-pink-800';
      case 'shop':
        return 'bg-blue-100 text-blue-800';
      case 'subscription':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentTypeLabel = (type: string | null | undefined) => {
    switch (type) {
      case 'donation':
        return 'Dar';
      case 'shop':
        return 'Obchod';
      case 'subscription':
        return 'Predplatné';
      default:
        return 'Neurčené';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="text-blue-600" size={32} />
            Bankové platby
          </h1>
          <p className="text-gray-600 mt-1">
            Prehľad všetkých platieb prijatých bankovým prevodom
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAutoMatch}
            disabled={matching || stats.unmatched === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {matching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Páruje sa...
              </>
            ) : (
              <>
                <TrendingUp size={20} />
                Spárovať platby ({stats.unmatched})
              </>
            )}
          </button>
          <button
            onClick={() => router.push('/admin/shop/banka/import')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-md"
          >
            <Upload size={20} />
            Importovať CSV
          </button>
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
              <Building2 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Celková suma</p>
              <p className="text-3xl font-bold text-blue-600">€{stats.totalAmount.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Banknote className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Spárované / Nespárované</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.matched} / <span className="text-orange-600">{stats.unmatched}</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tento mesiac</p>
              <p className="text-3xl font-bold text-purple-600">
                €{stats.thisMonthAmount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stats.thisMonth} platieb</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Hľadať podľa mena, správy, referencie alebo používateľa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterMatched('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterMatched === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Všetky ({stats.total})
          </button>
          <button
            onClick={() => setFilterMatched('matched')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterMatched === 'matched'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Spárované ({stats.matched})
          </button>
          <button
            onClick={() => setFilterMatched('unmatched')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterMatched === 'unmatched'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Nespárované ({stats.unmatched})
          </button>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dátum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platiteľ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Správa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Používateľ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ / Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcie
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Žiadne bankové platby
                  </td>
                </tr>
              ) : (
                filteredPayments
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(payment.transaction_date).toLocaleDateString('sk-SK')}
                      </div>
                      <div className="text-xs text-gray-500">{payment.payer_reference}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {payment.counterparty_name || 'Neznámy'}
                      </div>
                      <div className="text-xs text-gray-500">{payment.counterparty_account}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-xl text-blue-600">
                        €{payment.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">{payment.currency}</div>
                    </td>
                    <td className="px-6 py-4">
                      {payment.message_for_recipient || payment.additional_info ? (
                        <div className="text-sm text-gray-700 max-w-md">
                          {payment.message_for_recipient || payment.additional_info}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Bez správy</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payment.matched && payment.user_id ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {payment.user_name || payment.user_email || 'Neznámy'}
                          </div>
                          {payment.user_name && payment.user_email && (
                            <div className="text-xs text-gray-500">{payment.user_email}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Nespárované</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {payment.payment_type && (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTypeColor(payment.payment_type)}`}>
                            {getPaymentTypeLabel(payment.payment_type)}
                          </span>
                        )}
                        <div>
                          {payment.matched ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Spárované
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              Nespárované
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payment.matched ? (
                        <button
                          onClick={() => handleUnmatch(payment.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Odpárovať
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowMatchModal(true);
                          }}
                          className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <LinkIcon size={14} />
                          Spárovať
                        </button>
                      )}
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
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="text-sm text-gray-600">
            Strana {currentPage} z {totalPages} • Zobrazených {filteredPayments.length} platieb
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Predchádzajúca
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Nasledujúca
            </button>
          </div>
        </div>
      )}

      {/* Manual Match Modal */}
      {showMatchModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Spárovať platbu</h2>
              <button
                onClick={() => {
                  setShowMatchModal(false);
                  setSelectedPayment(null);
                  setSelectedUser(null);
                  setUserSearchTerm('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Detaily platby</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700">Suma:</span>
                    <span className="font-bold ml-2">€{selectedPayment.amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Dátum:</span>
                    <span className="ml-2">{new Date(selectedPayment.transaction_date).toLocaleDateString('sk-SK')}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">VS:</span>
                    <span className="ml-2 font-mono">{selectedPayment.payer_reference}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Platiteľ:</span>
                    <span className="ml-2">{selectedPayment.counterparty_name}</span>
                  </div>
                </div>
              </div>

              {/* Payment Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ platby
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPaymentType('donation')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectedPaymentType === 'donation'
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Dar
                  </button>
                  <button
                    onClick={() => setSelectedPaymentType('shop')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectedPaymentType === 'shop'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Obchod
                  </button>
                  <button
                    onClick={() => setSelectedPaymentType('subscription')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectedPaymentType === 'subscription'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Predplatné
                  </button>
                </div>
              </div>

              {/* User Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vyhľadať používateľa
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Email, meno alebo VS..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* User Results */}
              {loadingUsers ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : users.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedUser?.id === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {user.full_name || user.email}
                      </div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      {user.variable_symbol && (
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          VS: {user.variable_symbol}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : userSearchTerm.length >= 2 ? (
                <div className="text-center py-4 text-gray-500">
                  Žiadni používatelia nenájdení
                </div>
              ) : null}

              {/* Selected User */}
              {selectedUser && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Vybraný používateľ</h3>
                  <div className="text-sm">
                    <div className="font-medium text-green-900">{selectedUser.full_name || selectedUser.email}</div>
                    <div className="text-green-700">{selectedUser.email}</div>
                    {selectedUser.variable_symbol && (
                      <div className="text-green-700 font-mono mt-1">VS: {selectedUser.variable_symbol}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowMatchModal(false);
                  setSelectedPayment(null);
                  setSelectedUser(null);
                  setUserSearchTerm('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Zrušiť
              </button>
              <button
                onClick={handleManualMatch}
                disabled={!selectedUser}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Spárovať platbu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
