'use client';

import { useSupabase } from '@/app/components/SupabaseProvider';
import { motion } from 'framer-motion';
import { CreditCard, Heart, Package, Truck, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface UserData {
  email: string;
  name?: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  tracking_number: string | null;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price_at_time: number;
    product_name: string;
    product_snapshot: {
      name: { sk: string };
    };
  }>;
}

interface Subscription {
  id: string;
  tier: string;
  amount: number;
  status: string;
  interval: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface Donation {
  id: string;
  amount: number;
  created_at: string;
  message: string | null;
}

const TIER_LABELS: Record<string, string> = {
  free: 'Zadarmo',
  supporter: 'Podporovateľ',
  patron: 'Patron',
  benefactor: 'Dobrodinca',
  test_daily: 'Test Denné (🧪)',
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Čaká',
    paid: 'Zaplatené',
    processing: 'Spracováva sa',
    shipped: 'Odoslané',
    completed: 'Dokončené',
    cancelled: 'Zrušené',
  };
  return labels[status] || status;
}

function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return badges[status] || 'bg-gray-100 text-gray-800';
}

export default function AccountPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);

  const fetchUserData = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/login');
        return;
      }

      setUser({
        email: authUser.email!,
        name: authUser.user_metadata?.name,
      });

      // Fetch orders (without nested items for now, due to RLS issues)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, status, tracking_number, created_at')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('📦 Orders fetch:', {
        userId: authUser.id,
        count: ordersData?.length,
        error: ordersError,
        orders: ordersData
      });

      if (ordersError) {
        console.error('Orders fetch error:', ordersError);
      }
      
      // Add empty order_items array to match type
      const ordersWithItems = (ordersData || []).map(order => ({
        ...order,
        order_items: [] // TODO: Fetch order items separately
      }));
      
      setOrders(ordersWithItems);

      // Fetch active subscriptions (all of them, not just one)
      const { data: subscriptionsData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (subError) {
        console.error('Subscription fetch error:', subError);
      }
      
      setSubscriptions(subscriptionsData || []);

      // Fetch donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (donationsError) {
        console.error('Donations fetch error:', donationsError);
      }

      setDonations(donationsData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Naozaj chcete zrušiť toto predplatné? Zostane aktívne do konca aktuálneho obdobia.')) {
      return;
    }

    try {
      // Get current session to get access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      // Refresh data
      await fetchUserData();
      alert('Predplatné bolo úspešne zrušené. Zostáva aktívne do konca aktuálneho obdobia.');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Nepodarilo sa zrušiť predplatné. Skúste to prosím neskôr.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Načítavam...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #40467b 0%, #5a6191 50%, #40467b 100%)'
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-md rounded-3xl p-12 border"
            style={{
              backgroundColor: 'rgba(64, 70, 123, 0.75)',
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <User className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {user.name || 'Môj účet'}
            </h1>
            <p className="text-xl text-white/90 mb-6">{user.email}</p>
            <button
              onClick={handleSignOut}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-semibold backdrop-blur-sm border border-white/30"
            >
              Odhlásiť sa
            </button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Orders Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-md rounded-3xl p-8 mb-8 border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(64, 70, 123, 0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
              <Package size={24} style={{ color: '#40467b' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#40467b' }}>Moje objednávky</h2>
          </div>

          {orders.length === 0 ? (
            <p className="text-gray-600">Zatiaľ nemáte žiadne objednávky.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="backdrop-blur-sm rounded-2xl p-6 border hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: 'rgba(64, 70, 123, 0.03)',
                    borderColor: 'rgba(64, 70, 123, 0.15)'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Objednávka #{order.id}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleDateString('sk-SK')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          €{(item.price_at_time * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(64, 70, 123, 0.1)' }}>
                    <div>
                      <p className="text-sm text-gray-500">Celková suma</p>
                      <p className="text-xl font-bold" style={{ color: '#40467b' }}>€{order.total.toFixed(2)}</p>
                    </div>
                    {order.tracking_number && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#40467b' }}>
                        <Truck size={16} />
                        <span>Sledovanie: {order.tracking_number}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Subscription Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="backdrop-blur-md rounded-3xl p-8 mb-8 border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(64, 70, 123, 0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
              <CreditCard size={24} style={{ color: '#40467b' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#40467b' }}>Moje predplatné</h2>
          </div>

          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">Momentálne nemáte aktívne predplatné.</p>
              <Link
                href="/support"
                className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)'
                }}
              >
                Pozrieť predplatné
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription, index) => (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="backdrop-blur-sm rounded-2xl p-6 border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(64, 70, 123, 0.05) 0%, rgba(90, 97, 145, 0.05) 100%)',
                    borderColor: 'rgba(64, 70, 123, 0.15)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Aktuálny plán</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#40467b' }}>
                        {TIER_LABELS[subscription.tier] || subscription.tier}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : subscription.status === 'past_due'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.status === 'active' ? 'Aktívne' : subscription.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Suma</p>
                      <p className="text-xl font-bold text-gray-900">€{subscription.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Obdobie</p>
                      <p className="text-xl font-bold text-gray-900">
                        {subscription.interval === 'day' 
                          ? 'Denne' 
                          : subscription.interval === 'month' 
                          ? 'Mesačne' 
                          : 'Ročne'}
                      </p>
                    </div>
                  </div>

                  {subscription.current_period_end && (
                    <div className="pt-4 border-t mb-4" style={{ borderColor: 'rgba(64, 70, 123, 0.1)' }}>
                      <p className="text-sm text-gray-500">
                        {subscription.cancel_at_period_end ? 'Ukončí sa' : 'Obnoví sa'}: {' '}
                        <span className="font-medium text-gray-900">
                          {new Date(subscription.current_period_end).toLocaleDateString('sk-SK', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </p>
                    </div>
                  )}

                  {!subscription.cancel_at_period_end && (
                    <button
                      onClick={() => handleCancelSubscription(subscription.id)}
                      className="w-full px-4 py-2 rounded-lg font-medium text-red-600 border-2 border-red-200 hover:bg-red-50 transition-colors"
                    >
                      Zrušiť predplatné
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Donations Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="backdrop-blur-md rounded-3xl p-8 border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(64, 70, 123, 0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <Heart size={24} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#40467b' }}>Moje príspevky</h2>
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">Zatiaľ ste nevykonali žiadne jednorazové príspevky.</p>
              <Link
                href="/support"
                className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                }}
              >
                Podporiť projekt
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((donation) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="backdrop-blur-sm rounded-2xl p-6 border hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.02)',
                    borderColor: 'rgba(239, 68, 68, 0.15)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">€{donation.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(donation.created_at).toLocaleDateString('sk-SK')}
                      </p>
                      {donation.message && (
                        <p className="text-sm text-gray-700 mt-2 italic">&quot;{donation.message}&quot;</p>
                      )}
                    </div>
                    <Heart className="text-red-500" size={32} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
