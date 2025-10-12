"use client";

import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import { useLanguage } from '../components/LanguageProvider';
import { useSupabase } from '../components/SupabaseProvider';
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

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
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

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
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
      .select('full_name, avatar_url, role, created_at')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || '');
    }
  };

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

  const deleteAccount = async () => {
    if (!user || !supabase) return;

    if (deleteConfirmText !== t.validation.delete_confirmation_text) {
      showMessage('error', t.validation.delete_confirmation_required);
      return;
    }

    setIsDeletingAccount(true);
    try {
      // Najprv odstráň používateľa z databázy
      const { error: deleteUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteUserError) throw deleteUserError;

      // Odstráň avatar zo storage ak existuje
      if (profile?.avatar_url) {
        const fileName = profile.avatar_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${fileName}`]);
        }
      }

      // Nakoniec zmaž auth účet
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteAuthError) {
        // Ak admin API nefunguje, aspoň odhlás používateľa
        await supabase.auth.signOut();
      }

      showMessage('success', t.messages.account_deleted);
      
      // Presmeruj na hlavnú stránku
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error: unknown) {
      showMessage('error', `${t.messages.delete_error}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteDialog(false);
      setDeleteConfirmText('');
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setShowLogoutDialog(false);
    router.push('/login');
  };

  const handleSignOutClick = () => {
    setShowLogoutDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeMap = { sk: 'sk-SK', cz: 'cs-CZ', en: 'en-US', es: 'es-ES' };
    return date.toLocaleDateString(localeMap[lang]);
  };
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: '#40467b' }}></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: '#40467b' }}></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.loading.title}</h2>
          <p className="text-gray-600 text-sm">{t.loading.checking_access}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const sections = [
    {
      id: "profile-info",
      title: t.sections.profile_info.title,
      icon: <EditIcon />,
      content: (
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
                {profile?.avatar_url ? (
                  <NextImage 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon />
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <Loader2Icon />
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowAvatarPicker(true)}
              disabled={isUploading}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 focus:ring-4 focus:ring-opacity-30 transition-all duration-200 disabled:opacity-50"
              style={{ backgroundColor: '#40467b' }}
            >
              <CameraIcon />
              <span>{t.sections.profile_info.change_avatar}</span>
            </button>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {t.sections.profile_info.full_name}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
              style={{ '--tw-ring-color': '#40467b', '--tw-border-opacity': '1' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#40467b'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              placeholder={t.sections.profile_info.full_name_placeholder}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-4 focus:ring-opacity-30 transition-all duration-200 disabled:opacity-50 font-medium"
            style={{ backgroundColor: '#40467b' }}
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
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div style={{ color: '#40467b' }}>
                <MailIcon />
              </div>
              <div>
                <div className="font-medium" style={{ color: '#40467b' }}>{t.sections.account_info.email_address}</div>
                <div className="text-gray-700">{email}</div>
              </div>
            </div>
          </div>

          {profile?.created_at && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div style={{ color: '#40467b' }}>
                  <CalendarIcon />
                </div>
                <div>
                  <div className="font-medium" style={{ color: '#40467b' }}>{t.sections.account_info.registration_date}</div>
                  <div className="text-gray-700">{formatDate(profile.created_at)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="text-green-600">
                <ShieldIcon />
              </div>
              <div>
                <div className="font-medium text-green-900">{t.sections.account_info.user_role}</div>
                <div className="text-green-700">{profile?.role || t.sections.account_info.role_loading}</div>
              </div>
            </div>
          </div>
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
                                      {t.sections.notifications.topic_card.subscribed}: {formatDate(topic.subscribed_at)}
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
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-yellow-600">
                <LockIcon />
              </div>
              <h4 className="font-medium text-yellow-900">{t.sections.security.password_change.title}</h4>
            </div>
            <p className="text-yellow-800 text-sm mb-4">
              {t.sections.security.password_change.description}
            </p>
            <button
              onClick={() => setShowPasswordDialog(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <LockIcon />
              <span>{t.sections.security.password_change.button}</span>
            </button>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-red-600">
                <LogOutIcon />
              </div>
              <h4 className="font-medium text-red-900">{t.sections.security.logout.title}</h4>
            </div>
            <p className="text-red-800 text-sm mb-4">
              {t.sections.security.logout.description}
            </p>
            <button
              onClick={handleSignOutClick}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOutIcon />
              <span>{t.sections.security.logout.button}</span>
            </button>
          </div>

          <div className="bg-red-100 p-4 rounded-lg border border-red-300">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-red-700">
                <TrashIcon />
              </div>
              <h4 className="font-medium text-red-900">{t.sections.security.delete_account.title}</h4>
            </div>
            <p className="text-red-800 text-sm mb-4">
              {t.sections.security.delete_account.description}
            </p>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              <TrashIcon />
              <span>{t.sections.security.delete_account.button}</span>
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <UserIcon />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t.header.title}</h1>
                <p className="text-gray-600">{t.header.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border-green-200' 
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? <CheckIcon /> : <AlertIcon />}
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div style={{ color: '#40467b' }}>{section.icon}</div>
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                </div>
                <motion.div
                  animate={{ rotate: expandedSections.has(section.id) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
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
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                  {section.content}
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-600 mb-4">
              {t.footer.help_text}
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#40467b' }}
            >
              {t.footer.contact_us}
            </Link>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t.dialogs.avatar_picker.title}</h3>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <UploadIcon />
                </div>
                <span className="font-medium text-gray-700">{t.dialogs.avatar_picker.select_image}</span>
              </button>
            </div>
          </div>
        </div>
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