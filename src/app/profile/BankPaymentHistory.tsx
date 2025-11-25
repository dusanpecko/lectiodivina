'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '../components/SupabaseProvider';

interface BankPayment {
  id: string;
  transaction_date: string;
  amount: number;
  currency: string;
  payment_type: string | null;
  payer_reference: string;
  counterparty_name: string;
  matched_at: string;
}

const BankIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

export default function BankPaymentHistory() {
  const { session } = useSupabase();
  const [payments, setPayments] = useState<BankPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.access_token) {
      fetchPaymentHistory();
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPaymentHistory = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/users/payment-history', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Payment history error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to fetch payment history');
      }

      const data = await response.json();
      console.log('Payment history data:', data);
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTypeColor = (type: string | null) => {
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

  const getPaymentTypeLabel = (type: string | null) => {
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <BankIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">História platieb</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vaše bankové platby</p>
          </div>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <BankIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">História platieb</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vaše bankové platby</p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Zatiaľ nemáte žiadne spárované platby
        </div>
      </div>
    );
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-400">
          <BankIcon />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">História platieb</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {payments.length} {payments.length === 1 ? 'platba' : payments.length < 5 ? 'platby' : 'platieb'} • Celkom €{totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">
                  €{payment.amount.toFixed(2)}
                </span>
                {payment.payment_type && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentTypeColor(payment.payment_type)}`}>
                    {getPaymentTypeLabel(payment.payment_type)}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(payment.transaction_date).toLocaleDateString('sk-SK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              {payment.payer_reference && (
                <div className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
                  VS: {payment.payer_reference}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Spárované {new Date(payment.matched_at).toLocaleDateString('sk-SK')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
