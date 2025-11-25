"use client";

import { formatDate } from '@/utils/dateFormatter';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import { useLanguage } from '../components/LanguageProvider';
import { useSupabase } from '../components/SupabaseProvider';
import BankPaymentHistory from './BankPaymentHistory';
import { profileTranslations } from './translations';

// SVG Icons
const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const LogOutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Loader2Icon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v6m0 8v6M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M2 12h6m8 0h6M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const Package = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const Truck = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const CreditCard = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const Heart = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const Building2 = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const MapPin = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
  variable_symbol?: string | null;
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

interface PaymentHistoryItem {
  id: string;
  type: 'subscription' | 'donation' | 'bank_payment';
  amount: number;
  date: string;
  description: string;
  status?: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
}

interface BillingInfo {
  shipping_address: ShippingAddress | null;
  billing_address: ShippingAddress | null;
  company_name: string | null;
  ico: string | null;
  dic: string | null;
  iban: string | null;
}

interface NotificationTopic {
  id: string;
  name_sk: string;
  name_en: string | null;
  name_cs: string | null;
  name_es: string | null;
  slug: string;
  description_sk: string | null;
  description_en: string | null;
  description_cs: string | null;
  description_es: string | null;
  icon: string | null;
  color: string;
  category: string;
  display_order: number;
  is_default: boolean;
  is_subscribed: boolean;
  is_enabled: boolean;
  subscribed_at: string | null;
}

export default function ProfilePage() {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const { lang } = useLanguage();
  const t = profileTranslations[lang];
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['profile-info', 'account-info']));
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification state
  const [notificationTopics, setNotificationTopics] = useState<NotificationTopic[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string>('');
  const [totalSubscribed, setTotalSubscribed] = useState(0);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Orders, Subscriptions, Donations state
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Billing info state
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    shipping_address: null,
    billing_address: null,
    company_name: null,
    ico: null,
    dic: null,
    iban: null,
  });
  const [editingBilling, setEditingBilling] = useState(false);
  const [savingBilling, setSavingBilling] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user) return;
      
      const user = session.user;
      setUser(user);
      setEmail(user.email || '');
      await fetchProfile(user.id);
      await fetchNotificationPreferences();
    };

    if (!session && !isCheckingAuth) {
      router.replace('/login');
    } else if (session && !isCheckingAuth) {
      fetchUser();
    }
  }, [session, isCheckingAuth, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;

    const { data } = await supabase
      .from('users')
      .select('full_name, avatar_url, role, created_at, variable_symbol')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || '');
    }
  };

  const fetchOrdersAndBilling = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      const authUser = session.user;

      // Fetch all data in parallel using Promise.all - 5x faster!
      const [
        { data: ordersData, error: ordersError },
        { data: subscriptionsData, error: subError },
        { data: allSubscriptionsData, error: allSubError },
        { data: donationsData, error: donationsError },
        { data: bankPaymentsData, error: bankPaymentsError },
        { data: userData, error: userError }
      ] = await Promise.all([
        // Fetch orders
        supabase
          .from('orders')
          .select('id, total, status, tracking_number, created_at')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Fetch active subscriptions
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false }),
        
        // Fetch ALL subscription history (including inactive)
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false }),
        
        // Fetch donations
        supabase
          .from('donations')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Fetch bank payments
        supabase
          .from('bank_payments')
          .select('id, transaction_date, amount, currency, payment_type, payer_reference, matched_at')
          .eq('user_id', authUser.id)
          .eq('matched', true)
          .order('transaction_date', { ascending: false }),
        
        // Fetch billing information
        supabase
          .from('users')
          .select('shipping_address, billing_address, company_name, ico, dic, iban')
          .eq('email', authUser.email)
          .single()
      ]);

      // Handle errors
      if (ordersError) {
        console.error('Orders fetch error:', ordersError);
      }
      if (subError) {
        console.error('Subscription fetch error:', subError);
      }
      if (allSubError) {
        console.error('All subscriptions fetch error:', allSubError);
      }
      if (donationsError) {
        console.error('Donations fetch error:', donationsError);
      }
      if (bankPaymentsError) {
        console.error('Bank payments fetch error:', bankPaymentsError);
      }
      if (userError) {
        console.error('User billing info fetch error:', userError);
      }

      // Set orders
      const ordersWithItems = (ordersData || []).map(order => ({
        ...order,
        order_items: []
      }));
      setOrders(ordersWithItems);

      // Set subscriptions
      setSubscriptions(subscriptionsData || []);
      setDonations(donationsData || []);

      // Combine all payments into history
      const history: PaymentHistoryItem[] = [];
      
      // Add all subscriptions to history
      (allSubscriptionsData || []).forEach(sub => {
        history.push({
          id: sub.id,
          type: 'subscription',
          amount: sub.amount,
          date: sub.created_at,
          description: `${sub.tier} tier - ${sub.interval === 'month' ? 'Mesačné' : 'Ročné'} predplatné`,
          status: sub.status
        });
      });

      // Add all donations to history
      (donationsData || []).forEach(donation => {
        history.push({
          id: donation.id,
          type: 'donation',
          amount: donation.amount,
          date: donation.created_at,
          description: donation.message || 'Jednorazový príspevok'
        });
      });

      // Add all bank payments to history
      (bankPaymentsData || []).forEach(payment => {
        const paymentTypeLabel = payment.payment_type === 'donation' ? 'Dar' :
                                 payment.payment_type === 'shop' ? 'Obchod' :
                                 payment.payment_type === 'subscription' ? 'Predplatné' : 'Banková platba';
        history.push({
          id: payment.id,
          type: 'bank_payment',
          amount: payment.amount,
          date: payment.transaction_date,
          description: `${paymentTypeLabel} - VS: ${payment.payer_reference || 'N/A'}`
        });
      });

      // Sort by date (newest first)
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPaymentHistory(history);

      // Set billing info
      if (userData) {
        setBillingInfo({
          shipping_address: userData.shipping_address,
          billing_address: userData.billing_address,
          company_name: userData.company_name,
          ico: userData.ico,
          dic: userData.dic,
          iban: userData.iban,
        });
      }

    } catch (error) {
      console.error('Error fetching orders and billing:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, session]);

  useEffect(() => {
    if (session?.user) {
      fetchOrdersAndBilling();
    }
  }, [session, fetchOrdersAndBilling]);

  const fetchNotificationPreferences = async () => {
    if (!session?.access_token) return;

    setNotificationsLoading(true);
    setNotificationError('');

    try {
      const response = await fetch('/api/user/notification-preferences', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationTopics(data.topics || []);
        setTotalSubscribed(data.total_subscribed || 0);
      } else {
        const error = await response.json();
        setNotificationError(error.error || t.sections.notifications.error_loading);
      }
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
      setNotificationError(t.sections.notifications.error_loading);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const toggleNotificationSubscription = async (topicId: string, isEnabled: boolean) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic_id: topicId,
          is_enabled: isEnabled
        })
      });

      if (response.ok) {
        // Aktualizovať lokálny stav
        setNotificationTopics(prevTopics => 
          prevTopics.map(topic => 
            topic.id === topicId 
              ? { 
                  ...topic, 
                  is_subscribed: isEnabled,
                  is_enabled: isEnabled,
                  subscribed_at: isEnabled ? new Date().toISOString() : null
                }
              : topic
          )
        );

        // Aktualizovať počet prihlásených
        setTotalSubscribed(prev => isEnabled ? prev + 1 : Math.max(0, prev - 1));

        const message = isEnabled 
          ? t.sections.notifications.messages.subscribed_success
          : t.sections.notifications.messages.unsubscribed_success;
        
        showMessage('success', message);
      } else {
        const error = await response.json();
        const errorMessage = isEnabled 
          ? t.sections.notifications.messages.subscribe_error
          : t.sections.notifications.messages.unsubscribe_error;
        
        showMessage('error', `${errorMessage}: ${error.error}`);
      }
    } catch (err) {
      console.error('Error toggling notification subscription:', err);
      const errorMessage = isEnabled 
        ? t.sections.notifications.messages.subscribe_error
        : t.sections.notifications.messages.unsubscribe_error;
      
      showMessage('error', errorMessage);
    }
  };

  const bulkToggleNotifications = async (subscribe: boolean) => {
    if (!session?.access_token) return;

    const promises = notificationTopics
      .filter(topic => topic.is_enabled !== subscribe)
      .map(topic => toggleNotificationSubscription(topic.id, subscribe));

    try {
      await Promise.all(promises);
      const message = subscribe 
        ? t.sections.notifications.messages.bulk_subscribe_success
        : t.sections.notifications.messages.bulk_unsubscribe_success;
      
      showMessage('success', message);
    } catch (err) {
      console.error('Error bulk toggling notifications:', err);
      showMessage('error', 'Chyba pri hromadnej úprave nastavení');
    }
  };

  const getTopicName = (topic: NotificationTopic): string => {
    switch (lang) {
      case 'en': return topic.name_en || topic.name_sk;
      case 'cz': return topic.name_cs || topic.name_sk;  
      case 'es': return topic.name_es || topic.name_sk;
      default: return topic.name_sk;
    }
  };

  const getTopicDescription = (topic: NotificationTopic): string => {
    switch (lang) {
      case 'en': return topic.description_en || topic.description_sk || '';
      case 'cz': return topic.description_cs || topic.description_sk || '';
      case 'es': return topic.description_es || topic.description_sk || '';
      default: return topic.description_sk || '';
    }
  };

  const getCategoryName = (category: string): string => {
    return t.sections.notifications.category[category as keyof typeof t.sections.notifications.category] || category;
  };

  const getIconEmoji = (icon: string | null) => {
    const iconMap: Record<string, string> = {
      'book-open': '📖',
      'bell': '🔔',
      'hands-praying': '🙏',
      'rosary': '📿',
      'calendar': '📅',
      'star': '⭐',
      'heart': '❤️',
      'church': '⛪',
      'cross': '✝️',
      'bible': '📜',
      'candle': '🕯️',
      'dove': '🕊️',
    };
    return iconMap[icon || 'bell'] || '🔔';
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const saveProfile = async () => {
    if (!user || !fullName.trim()) {
      showMessage('error', t.validation.name_required);
      return;
    }

    setIsSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ full_name: fullName.trim() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email.trim()
        });
        if (emailError) throw emailError;
      }

      showMessage('success', t.messages.profile_saved);
    } catch (error: unknown) {
      showMessage('error', `${t.messages.save_error}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user || !supabase) return;

    setIsUploading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      canvas.width = 400;
      canvas.height = 400;
      
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;
      
      ctx?.drawImage(img, x, y, size, size, 0, 0, 400, 400);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.75);
      });

      const fileExt = 'jpg';
      const filePath = `avatars/${user.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      showMessage('success', t.messages.avatar_changed);
    } catch (error: unknown) {
      showMessage('error', `${t.messages.avatar_error}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setShowAvatarPicker(false);
    }
  };

  const changePassword = async () => {
    if (!user?.email || !supabase) return;

    if (newPassword.length < 6) {
      setPasswordError(t.validation.password_min_length);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t.validation.passwords_not_match);
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(t.validation.password_same_as_current);
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        setPasswordError(t.validation.wrong_current_password);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setShowPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', t.messages.password_changed);
    } catch (error: unknown) {
      setPasswordError(`${t.messages.password_error}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Naozaj chcete zrušiť toto predplatné? Zostane aktívne do konca aktuálneho obdobia.')) {
      return;
    }

    try {
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

      await fetchOrdersAndBilling();
      showMessage('success', 'Predplatné bolo úspešne zrušené. Zostáva aktívne do konca aktuálneho obdobia.');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      showMessage('error', 'Nepodarilo sa zrušiť predplatné. Skúste to prosím neskôr.');
    }
  };

  const handleSaveBillingInfo = async () => {
    setSavingBilling(true);
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('users')
        .update({
          shipping_address: billingInfo.shipping_address,
          billing_address: billingInfo.billing_address,
          company_name: billingInfo.company_name,
          ico: billingInfo.ico,
          dic: billingInfo.dic,
          iban: billingInfo.iban,
        })
        .eq('email', authUser.email);

      if (error) {
        throw error;
      }

      showMessage('success', 'Fakturačné údaje boli úspešne uložené.');
      setEditingBilling(false);
    } catch (error) {
      console.error('Error saving billing info:', error);
      showMessage('error', 'Nepodarilo sa uložiť fakturačné údaje. Skúste to prosím neskôr.');
    } finally {
      setSavingBilling(false);
    }
  };

  const deleteAccount = async () => {
    if (!user || !supabase) return;

    if (deleteConfirmText !== t.validation.delete_confirmation_text) {
      showMessage('error', t.validation.delete_confirmation_required);
      return;
    }

    setIsDeletingAccount(true);
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      // Call API endpoint to delete account
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Sign out locally
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.error('Logout error after deletion:', err);
      }

      showMessage('success', t.messages.account_deleted);
      
      // Redirect to home page
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);

    } catch (error: unknown) {
      console.error('Delete account error:', error);
      showMessage('error', `${t.messages.delete_error}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteDialog(false);
      setDeleteConfirmText('');
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setShowLogoutDialog(false);
    router.push('/login');
    router.refresh();
  };

  const handleSignOutClick = () => {
    setShowLogoutDialog(true);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)' }}></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: '#40467b', borderRightColor: '#5a6191' }}></div>
            <div className="absolute inset-3 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: '#6b72a8', animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.loading.title}</h2>
          <p className="text-gray-600">{t.loading.checking_access}</p>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Show loading state while fetching orders and billing data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)' }}></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: '#40467b', borderRightColor: '#5a6191' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Načítavam údaje...</h2>
          <p className="text-gray-600">Prosím počkajte</p>
        </motion.div>
      </div>
    );
  }

  const sections = [
    {
      id: "profile-info",
      title: t.sections.profile_info.title,
      icon: <EditIcon />,
      content: (
        <div className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {t.sections.profile_info.full_name}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 bg-white"
              placeholder={t.sections.profile_info.full_name_placeholder}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="w-full text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 font-semibold text-lg"
            style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
          >
            {isSaving ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2Icon />
                <span>{t.sections.profile_info.saving}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <SaveIcon />
                <span>{t.sections.profile_info.save_changes}</span>
              </div>
            )}
          </button>
        </div>
      )
    },
    {
      id: "account-info",
      title: t.sections.account_info.title,
      icon: <UserIcon />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border-2 border-indigo-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)', color: 'white' }}>
                <MailIcon />
              </div>
              <div>
                <div className="font-semibold text-indigo-900">{t.sections.account_info.email_address}</div>
                <div className="text-gray-700">{email}</div>
              </div>
            </div>
          </div>

          {profile?.created_at && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)', color: 'white' }}>
                  <CalendarIcon />
                </div>
                <div>
                  <div className="font-semibold text-indigo-900">{t.sections.account_info.registration_date}</div>
                  <div className="text-gray-700">{formatDate(profile.created_at, lang as 'sk' | 'cz' | 'en' | 'es')}</div>
                </div>
              </div>
            </div>
          )}

          {profile?.variable_symbol && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-5 rounded-xl border-2 border-cyan-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                  <span className="text-xl font-bold">VS</span>
                </div>
                <div>
                  <div className="font-semibold text-cyan-900">Variabilný symbol</div>
                  <div className="text-gray-700 font-mono text-lg">{profile.variable_symbol}</div>
                  <div className="text-xs text-gray-600 mt-1">Pre trvalé príkazy v banke</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <ShieldIcon />
              </div>
              <div>
                <div className="font-semibold text-green-900">{t.sections.account_info.user_role}</div>
                <div className="text-green-700 font-medium">{profile?.role || t.sections.account_info.role_loading}</div>
              </div>
            </div>
          </div>

          {/* Supporter Badge */}
          {subscriptions.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border-2 border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-yellow-600 text-white">
                    <span className="text-xl">⭐</span>
                  </div>
                  <div>
                    <div className="font-semibold text-amber-900">Stav podpory</div>
                    <div className="text-amber-700 font-medium">
                      {subscriptions.some(s => s.tier === 'founder') ? '🏆 Zakladateľ' :
                       subscriptions.some(s => s.tier === 'patron') ? '💎 Patron' :
                       '❤️ Priateľ'}
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  subscriptions.some(s => s.tier === 'founder') ? 'bg-purple-600 text-white' :
                  subscriptions.some(s => s.tier === 'patron') ? 'bg-blue-600 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {subscriptions.some(s => s.tier === 'founder') ? 'FOUNDER' :
                   subscriptions.some(s => s.tier === 'patron') ? 'PATRON' :
                   'FRIEND'}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: "notifications",
      title: t.sections.notifications.title,
      icon: <BellIcon />,
      content: (
        <div className="space-y-6">
          {/* Header with description */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">{t.sections.notifications.description}</p>
          </div>

          {/* Stats and Bulk Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <BellIcon />
              <span className="font-medium">{t.sections.notifications.total_subscribed}: {totalSubscribed}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => bulkToggleNotifications(true)}
                disabled={notificationsLoading}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
              >
                {t.sections.notifications.subscribe_all}
              </button>
              <button
                onClick={() => bulkToggleNotifications(false)}
                disabled={notificationsLoading}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
              >
                {t.sections.notifications.unsubscribe_all}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {notificationsLoading && (
            <div className="text-center py-8">
              <Loader2Icon />
              <p className="text-gray-600 mt-2">{t.sections.notifications.loading}</p>
            </div>
          )}

          {/* Error State */}
          {notificationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertIcon />
                <span className="text-red-800">{notificationError}</span>
              </div>
            </div>
          )}

          {/* Topics List */}
          {!notificationsLoading && !notificationError && (
            <>
              {notificationTopics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t.sections.notifications.no_topics_available}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    notificationTopics.reduce((groups, topic) => {
                      const category = topic.category || 'other';
                      if (!groups[category]) groups[category] = [];
                      groups[category].push(topic);
                      return groups;
                    }, {} as Record<string, NotificationTopic[]>)
                  ).map(([category, topics]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">
                        {getCategoryName(category)}
                      </h4>
                      <div className="grid gap-4">
                        {topics.map(topic => (
                          <div
                            key={topic.id}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                              topic.is_enabled
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                                  style={{ backgroundColor: topic.color + '20', color: topic.color }}
                                >
                                  {getIconEmoji(topic.icon)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h5 className="font-medium text-gray-900">{getTopicName(topic)}</h5>
                                    {topic.is_default && (
                                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        {t.sections.notifications.topic_card.default_topic}
                                      </span>
                                    )}
                                  </div>
                                  {getTopicDescription(topic) && (
                                    <p className="text-sm text-gray-600 mt-1">{getTopicDescription(topic)}</p>
                                  )}
                                  {topic.is_enabled && topic.subscribed_at && (
                                    <p className="text-xs text-green-600 mt-1">
                                      {t.sections.notifications.topic_card.subscribed}: {formatDate(topic.subscribed_at, lang as 'sk' | 'cz' | 'en' | 'es')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => toggleNotificationSubscription(topic.id, !topic.is_enabled)}
                                disabled={notificationsLoading}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                                  topic.is_enabled
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {topic.is_enabled 
                                  ? t.sections.notifications.topic_card.unsubscribe
                                  : t.sections.notifications.topic_card.subscribe
                                }
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )
    },
    {
      id: "security",
      title: t.sections.security.title,
      icon: <LockIcon />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-yellow-600">
                <LockIcon />
              </div>
              <h4 className="font-bold text-yellow-900">{t.sections.security.password_change.title}</h4>
            </div>
            <p className="text-yellow-800 text-sm mb-4">
              {t.sections.security.password_change.description}
            </p>
            <button
              onClick={() => setShowPasswordDialog(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
            >
              <LockIcon />
              <span>{t.sections.security.password_change.button}</span>
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-blue-600">
                <LogOutIcon />
              </div>
              <h4 className="font-bold text-blue-900">{t.sections.security.logout.title}</h4>
            </div>
            <p className="text-blue-800 text-sm mb-4">
              {t.sections.security.logout.description}
            </p>
            <button
              onClick={handleSignOutClick}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              <LogOutIcon />
              <span>{t.sections.security.logout.button}</span>
            </button>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-5 rounded-xl border-2 border-red-300">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-red-700">
                <TrashIcon />
              </div>
              <h4 className="font-bold text-red-900">{t.sections.security.delete_account.title}</h4>
            </div>
            <p className="text-red-800 text-sm mb-4">
              {t.sections.security.delete_account.description}
            </p>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            >
              <TrashIcon />
              <span>{t.sections.security.delete_account.button}</span>
            </button>
          </div>
        </div>
      )
    },
    {
      id: "orders",
      title: "Moje objednávky",
      icon: <Package size={24} />,
      content: (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">Zatiaľ ste nevytvorili žiadne objednávky.</p>
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #40467b 0%, #2d3356 100%)' }}
              >
                Prejsť do obchodu
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="backdrop-blur-sm rounded-2xl p-6 border hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: 'rgba(64, 70, 123, 0.02)',
                    borderColor: 'rgba(64, 70, 123, 0.15)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Objednávka #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">€{order.total.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'completed' ? 'Dokončená' :
                         order.status === 'processing' ? 'Spracováva sa' :
                         order.status === 'shipped' ? 'Odoslaná' : order.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(order.created_at).toLocaleDateString('sk-SK')}
                      </p>
                    </div>
                  </div>
                  {order.tracking_number && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <Truck size={16} />
                      <span>Sledovacie číslo: {order.tracking_number}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: "subscriptions",
      title: "Moje predplatné",
      icon: <CreditCard size={24} />,
      content: (
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">Momentálne nemáte žiadne aktívne predplatné.</p>
              <Link
                href="/support"
                className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
              >
                Podporiť projekt
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="backdrop-blur-sm rounded-2xl p-6 border hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.02)',
                    borderColor: 'rgba(139, 92, 246, 0.15)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 capitalize">
                        {subscription.tier} tier
                      </h3>
                      <p className="text-2xl font-bold text-purple-600 mt-1">
                        €{subscription.amount.toFixed(2)}/{subscription.interval === 'month' ? 'mes.' : 'rok'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Aktívne
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Ďalšia platba: {new Date(subscription.current_period_end).toLocaleDateString('sk-SK')}</p>
                  </div>

                  {subscription.cancel_at_period_end && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        Predplatné bude zrušené {new Date(subscription.current_period_end).toLocaleDateString('sk-SK')}
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
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: "donations",
      title: "Moje príspevky",
      icon: <Heart size={24} />,
      content: (
        <div className="space-y-4">
          {donations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">Zatiaľ ste nevykonali žiadne jednorazové príspevky.</p>
              <Link
                href="/support"
                className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
              >
                Podporiť projekt
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((donation) => (
                <div
                  key={donation.id}
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
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: "bank-payments",
      title: "Bankové platby",
      icon: <Building2 size={24} />,
      content: (
        <BankPaymentHistory />
      )
    },
    {
      id: "payment-history",
      title: "História platieb",
      icon: <CreditCard size={24} />,
      content: (
        <div className="space-y-4">
          {paymentHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">Zatiaľ nemáte žiadne platby.</p>
              <Link
                href="/support"
                className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
              >
                Podporiť projekt
              </Link>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-gray-700">
                  <div className="col-span-1 flex items-center justify-center">Typ</div>
                  <div className="col-span-5">Popis</div>
                  <div className="col-span-2">Dátum</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Suma</div>
                </div>
              </div>
              
              {/* Table Body with Scroll */}
              <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                {paymentHistory.map((payment, index) => (
                  <div
                    key={payment.id}
                    className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    {/* Type Icon */}
                    <div className="col-span-1 flex items-center justify-center">
                      {payment.type === 'subscription' ? (
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                          <CreditCard size={16} />
                        </div>
                      ) : payment.type === 'bank_payment' ? (
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <Building2 size={16} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500">
                          <Heart size={16} />
                        </div>
                      )}
                    </div>
                    
                    {/* Description */}
                    <div className="col-span-5 flex items-center">
                      <span className="text-sm text-gray-900 truncate" title={payment.description}>
                        {payment.description}
                      </span>
                    </div>
                    
                    {/* Date */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-gray-600">
                        {new Date(payment.date).toLocaleDateString('sk-SK')}
                      </span>
                    </div>
                    
                    {/* Status */}
                    <div className="col-span-2 flex items-center">
                      {payment.status ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.status === 'canceled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status === 'active' ? 'Aktívne' : payment.status === 'canceled' ? 'Zrušené' : payment.status}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </div>
                    
                    {/* Amount */}
                    <div className="col-span-2 flex items-center justify-end">
                      <span className={`text-sm font-bold ${
                        payment.type === 'subscription' ? 'text-purple-600' : 
                        payment.type === 'bank_payment' ? 'text-blue-600' : 
                        'text-red-500'
                      }`}>
                        €{payment.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Table Footer with Total */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t-2 border-gray-300">
                <div className="grid grid-cols-12 gap-4 px-4 py-4">
                  <div className="col-span-5 flex items-center text-sm">
                    <span className="font-semibold text-gray-700">Celkový počet platieb:</span>
                    <span className="ml-2 font-bold text-gray-900">{paymentHistory.length}</span>
                  </div>
                  <div className="col-span-7 flex items-center justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Celková podpora Lectio Divina:</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        €{paymentHistory.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
                      </span>
                      <span className="text-xl">❤️</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: "billing",
      title: "Fakturačné údaje",
      icon: <Building2 size={24} />,
      content: (
        <div className="space-y-6">
          {editingBilling ? (
            <div className="space-y-6">
              {/* Shipping Address */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div style={{ color: '#40467b' }}>
                    <MapPin size={20} />
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: '#40467b' }}>Dodacia adresa</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Meno a priezvisko"
                    value={billingInfo.shipping_address?.name || ''}
                    onChange={(e) => setBillingInfo({
                      ...billingInfo,
                      shipping_address: { ...billingInfo.shipping_address, name: e.target.value } as ShippingAddress
                    })}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={billingInfo.shipping_address?.email || ''}
                    onChange={(e) => setBillingInfo({
                      ...billingInfo,
                      shipping_address: { ...billingInfo.shipping_address, email: e.target.value } as ShippingAddress
                    })}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Ulica a číslo"
                    value={billingInfo.shipping_address?.street || ''}
                    onChange={(e) => setBillingInfo({
                      ...billingInfo,
                      shipping_address: { ...billingInfo.shipping_address, street: e.target.value } as ShippingAddress
                    })}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Mesto"
                    value={billingInfo.shipping_address?.city || ''}
                    onChange={(e) => setBillingInfo({
                      ...billingInfo,
                      shipping_address: { ...billingInfo.shipping_address, city: e.target.value } as ShippingAddress
                    })}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="PSČ"
                    value={billingInfo.shipping_address?.postal_code || ''}
                    onChange={(e) => setBillingInfo({
                      ...billingInfo,
                      shipping_address: { ...billingInfo.shipping_address, postal_code: e.target.value } as ShippingAddress
                    })}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Krajina"
                    value={billingInfo.shipping_address?.country || ''}
                    onChange={(e) => setBillingInfo({
                      ...billingInfo,
                      shipping_address: { ...billingInfo.shipping_address, country: e.target.value } as ShippingAddress
                    })}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Telefón"
                    value={billingInfo.shipping_address?.phone || ''}
                    onChange={(e) => setBillingInfo({
                      ...billingInfo,
                      shipping_address: { ...billingInfo.shipping_address, phone: e.target.value } as ShippingAddress
                    })}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Company Info */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div style={{ color: '#40467b' }}>
                    <Building2 size={20} />
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: '#40467b' }}>Údaje o firme (nepovinné)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Názov firmy"
                    value={billingInfo.company_name || ''}
                    onChange={(e) => setBillingInfo({ ...billingInfo, company_name: e.target.value })}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="IČO"
                    value={billingInfo.ico || ''}
                    onChange={(e) => setBillingInfo({ ...billingInfo, ico: e.target.value })}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="DIČ"
                    value={billingInfo.dic || ''}
                    onChange={(e) => setBillingInfo({ ...billingInfo, dic: e.target.value })}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="IBAN"
                    value={billingInfo.iban || ''}
                    onChange={(e) => setBillingInfo({ ...billingInfo, iban: e.target.value })}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none md:col-span-2"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveBillingInfo}
                  disabled={savingBilling}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #40467b 0%, #2d3356 100%)' }}
                >
                  <SaveIcon />
                  {savingBilling ? 'Ukladám...' : 'Uložiť údaje'}
                </button>
                <button
                  onClick={() => {
                    setEditingBilling(false);
                    fetchOrdersAndBilling();
                  }}
                  disabled={savingBilling}
                  className="px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  style={{
                    color: '#40467b',
                    border: '2px solid rgba(64, 70, 123, 0.2)',
                    backgroundColor: 'rgba(64, 70, 123, 0.05)'
                  }}
                >
                  Zrušiť
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Display Shipping Address */}
              {billingInfo.shipping_address && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div style={{ color: '#40467b' }}>
                      <MapPin size={18} />
                    </div>
                    <h3 className="font-semibold" style={{ color: '#40467b' }}>Dodacia adresa</h3>
                  </div>
                  <div className="text-gray-700 space-y-1">
                    <p>{billingInfo.shipping_address.name}</p>
                    <p>{billingInfo.shipping_address.street}</p>
                    <p>{billingInfo.shipping_address.postal_code} {billingInfo.shipping_address.city}</p>
                    <p>{billingInfo.shipping_address.country}</p>
                    <p className="text-sm mt-2">{billingInfo.shipping_address.email}</p>
                    <p className="text-sm">{billingInfo.shipping_address.phone}</p>
                  </div>
                </div>
              )}

              {/* Display Company Info */}
              {billingInfo.company_name && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div style={{ color: '#40467b' }}>
                      <Building2 size={18} />
                    </div>
                    <h3 className="font-semibold" style={{ color: '#40467b' }}>Údaje o firme</h3>
                  </div>
                  <div className="text-gray-700 space-y-1">
                    <p className="font-medium">{billingInfo.company_name}</p>
                    {billingInfo.ico && <p className="text-sm">IČO: {billingInfo.ico}</p>}
                    {billingInfo.dic && <p className="text-sm">DIČ: {billingInfo.dic}</p>}
                    {billingInfo.iban && <p className="text-sm">IBAN: {billingInfo.iban}</p>}
                  </div>
                </div>
              )}

              {!billingInfo.shipping_address && !billingInfo.company_name && (
                <div className="text-center py-8">
                  <p className="text-gray-600">Zatiaľ nemáte uložené žiadne fakturačné údaje.</p>
                </div>
              )}

              <button
                onClick={() => setEditingBilling(true)}
                className="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  color: '#40467b',
                  border: '2px solid rgba(64, 70, 123, 0.2)',
                  backgroundColor: 'rgba(64, 70, 123, 0.05)'
                }}
              >
                Upraviť fakturačné údaje
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Header with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 relative overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, #40467b 0%, #5a6191 50%, #6b72a8 100%)',
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl"
                  style={{
                    border: subscriptions.length > 0 
                      ? `4px solid ${
                          subscriptions.some(s => s.tier === 'founder') ? '#9333ea' :
                          subscriptions.some(s => s.tier === 'patron') ? '#2563eb' :
                          '#ef4444'
                        }`
                      : '4px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  {profile?.avatar_url ? (
                    <NextImage 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white/70">
                      <UserIcon />
                    </div>
                  )}
                </div>
                {isUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <Loader2Icon />
                  </div>
                )}
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                >
                  <CameraIcon />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {fullName || t.loading.title}
                </h1>
                <p className="text-indigo-100 text-lg mb-4">{email}</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {profile?.created_at && (
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center gap-2">
                      <CalendarIcon />
                      {formatDate(profile.created_at, lang as 'sk' | 'cz' | 'en' | 'es')}
                    </div>
                  )}
                  {profile?.role && (
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center gap-2">
                      <ShieldIcon />
                      {profile.role}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <div className={`p-5 rounded-2xl border-2 shadow-lg ${
              message.type === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-900 border-red-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {message.type === 'success' ? <CheckIcon /> : <AlertIcon />}
                </div>
                <span className="font-semibold text-lg">{message.text}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top Sections - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Profile Info & Billing */}
          <div className="space-y-6">
            {sections.filter(s => s.id === 'profile-info' || s.id === 'billing').map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-transparent to-indigo-50/30 hover:to-indigo-50/50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300"
                        style={{ 
                          background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)',
                          color: 'white'
                        }}
                      >
                        {section.icon}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-900 transition-colors">{section.title}</h2>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSections.has(section.id) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-400 group-hover:text-indigo-600 transition-colors"
                    >
                      <ChevronDownIcon />
                    </motion.div>
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedSections.has(section.id) ? "auto" : 0,
                      opacity: expandedSections.has(section.id) ? 1 : 0
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 text-gray-700 leading-relaxed">
                      {section.content}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column - Account Info */}
          <div className="space-y-6">
            {sections.filter(s => s.id === 'account-info').map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-transparent to-indigo-50/30 hover:to-indigo-50/50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300"
                        style={{ 
                          background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)',
                          color: 'white'
                        }}
                      >
                        {section.icon}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-900 transition-colors">{section.title}</h2>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSections.has(section.id) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-400 group-hover:text-indigo-600 transition-colors"
                    >
                      <ChevronDownIcon />
                    </motion.div>
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedSections.has(section.id) ? "auto" : 0,
                      opacity: expandedSections.has(section.id) ? 1 : 0
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 text-gray-700 leading-relaxed">
                      {section.content}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Other Sections - Single Full Width Column */}
        <div className="space-y-6">
          {sections.filter(s => !['profile-info', 'account-info', 'billing'].includes(s.id)).map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-transparent to-indigo-50/30 hover:to-indigo-50/50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)',
                        color: 'white'
                      }}
                    >
                      {section.icon}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-900 transition-colors">{section.title}</h2>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSections.has(section.id) ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-400 group-hover:text-indigo-600 transition-colors"
                  >
                    <ChevronDownIcon />
                  </motion.div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedSections.has(section.id) ? "auto" : 0,
                    opacity: expandedSections.has(section.id) ? 1 : 0
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-2 text-gray-700 leading-relaxed">
                    {section.content}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-indigo-100/50">
            <p className="text-gray-600 mb-6 text-lg">
              {t.footer.help_text}
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
              style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
            >
              <MailIcon />
              {t.footer.contact_us}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAvatarPicker(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{t.dialogs.avatar_picker.title}</h3>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowAvatarPicker(false);
                }}
                className="w-full py-4 px-6 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
              >
                {t.dialogs.avatar_picker.upload}
              </button>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="w-full py-4 px-6 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t.dialogs.avatar_picker.cancel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-red-900">{t.dialogs.delete_account.title}</h3>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <TrashIcon />
                  <span className="font-medium text-red-900">{t.dialogs.delete_account.warning_title}</span>
                </div>
                <p className="text-red-800 text-sm">
                  {t.dialogs.delete_account.warning_text}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t.dialogs.delete_account.confirmation_label} <span className="font-bold text-red-600">{t.dialogs.delete_account.confirmation_text}</span>
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder={`${t.dialogs.delete_account.confirmation_label.split(':')[0]} ${t.dialogs.delete_account.confirmation_text}`}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700 text-sm">
                  <strong>{t.dialogs.delete_account.what_will_be_deleted}</strong>
                </p>
                <ul className="text-gray-600 text-sm mt-2 space-y-1">
                  <li>• {t.dialogs.delete_account.deletion_list.profile}</li>
                  <li>• {t.dialogs.delete_account.deletion_list.avatar}</li>
                  <li>• {t.dialogs.delete_account.deletion_list.data}</li>
                  <li>• {t.dialogs.delete_account.deletion_list.admin_access}</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
              >
                {t.dialogs.delete_account.cancel}
              </button>
              <button
                onClick={deleteAccount}
                disabled={isDeletingAccount || deleteConfirmText !== t.validation.delete_confirmation_text}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-200 disabled:opacity-50 font-medium"
              >
                {isDeletingAccount ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2Icon />
                    <span>{t.dialogs.delete_account.deleting}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <TrashIcon />
                    <span>{t.dialogs.delete_account.delete}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t.dialogs.change_password.title}</h3>
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t.dialogs.change_password.current_password}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 transition-all duration-200"
                    style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#40467b'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t.dialogs.change_password.new_password}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 transition-all duration-200"
                    style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#40467b'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t.dialogs.change_password.confirm_password}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 transition-all duration-200"
                    style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#40467b'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertIcon />
                    <span className="text-red-700 text-sm font-medium">{passwordError}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
              >
                {t.dialogs.change_password.cancel}
              </button>
              <button
                onClick={changePassword}
                disabled={isChangingPassword}
                className="flex-1 text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-4 focus:ring-opacity-30 transition-all duration-200 disabled:opacity-50 font-medium"
                style={{ backgroundColor: '#40467b' }}
              >
                {isChangingPassword ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2Icon />
                    <span>{t.dialogs.change_password.changing}</span>
                  </div>
                ) : (
                  t.dialogs.change_password.change
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleAvatarUpload(file);
        }}
        className="hidden"
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        title={t.dialogs.logout.title}
        message={t.dialogs.logout.message}
        confirmText={t.dialogs.logout.logout}
        cancelText={t.dialogs.logout.cancel}
        onConfirm={signOut}
        onCancel={() => setShowLogoutDialog(false)}
        type="warning"
      />
    </div>
  );
}