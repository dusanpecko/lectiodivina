'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '../../components/SupabaseProvider';
import { useLanguage } from '../../components/LanguageProvider';
import { forgotPasswordTranslations } from './translations';
import { 
  Mail, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Shield,
  Key
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const { supabase } = useSupabase();
  const { lang } = useLanguage();
  const t = forgotPasswordTranslations[lang];
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setMessage(t.emailSentMessage);
      setEmailSent(true);
      setEmail('');
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || t.sendError);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setEmailSent(false);
    setMessage(null);
    setError(null);
  };

  if (emailSent && message) {
    return (
      <div className="w-full">
        {/* Success State */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg shadow-lg mb-2" style={{ backgroundColor: '#10b981' }}>
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-0.5">
            {t.emailSent}
          </h1>
          <p className="text-white/70 text-xs">
            {t.checkInbox}
          </p>
        </div>

        {/* Success Message */}
        <div className="mb-4 p-3 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium text-sm mb-0.5">{t.emailSuccessfullySent}</p>
              <p className="text-green-700 text-xs leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <Mail size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1.5">{t.nextSteps}</p>
              <ol className="space-y-0.5 list-decimal list-inside">
                <li>{t.step1}</li>
                <li>{t.step2}</li>
                <li>{t.step3}</li>
                <li>{t.step4}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Warning about spam */}
        <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700">
              <p className="font-medium mb-1">{t.noEmail}</p>
              <ul className="space-y-0.5">
                <li>• {t.checkSpam}</li>
                <li>• {t.wait2to3Minutes}</li>
                <li>• {t.verifyEmail}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="w-full text-white py-2.5 px-4 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            style={{ backgroundColor: '#686ea3' }}
          >
            <div className="flex items-center justify-center space-x-2">
              <Send size={16} />
              <span>{t.sendAgain}</span>
            </div>
          </button>

          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg transition-all duration-200 font-semibold text-white text-sm hover:opacity-90"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <ArrowLeft size={16} />
            <span>{t.backToLogin}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg shadow-lg mb-2" style={{ backgroundColor: '#686ea3' }}>
          <Key size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white mb-0.5">
          {t.forgotPasswordTitle}
        </h1>
        <p className="text-white/70 text-xs">
          {t.forgotPasswordSubtitle}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-red-800 font-medium text-sm">{t.sendingError}</span>
          </div>
          <p className="text-red-700 text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/90 flex items-center">
            <Mail size={14} className="mr-1.5" />
            {t.email}
          </label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 pl-9 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all duration-200 text-white placeholder-white/50 text-sm"
              disabled={loading}
            />
            <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
          </div>
          <p className="text-xs text-white/60">
            {t.emailHelp}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full text-white py-2.5 px-4 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
          style={{ backgroundColor: '#686ea3' }}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 size={16} className="animate-spin" />
              <span>{t.sendingEmail}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Send size={16} />
              <span>{t.sendResetEmail}</span>
            </div>
          )}
        </button>
      </form>

      {/* Security info */}
      <div className="mt-6 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-start space-x-2">
          <Shield size={14} className="text-white/70 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-white/70">
            <p className="font-medium mb-0.5">{t.securityInfo}</p>
            <p>
              {t.linkValidFor}
            </p>
          </div>
        </div>
      </div>

      {/* Back to login */}
      <div className="mt-4">
        <Link
          href="/login"
          className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg transition-all duration-200 font-semibold text-white text-sm hover:opacity-90"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <ArrowLeft size={16} />
          <span>{t.backToLogin}</span>
        </Link>
      </div>

      {/* Help section */}
      <div className="mt-4 text-center">
        <p className="text-xs text-white/70">
          {t.stillHaveProblems}{" "}
          <Link href="/contact" className="text-white hover:text-white/90 underline font-medium">
            {t.contactSupport}
          </Link>
        </p>
      </div>
    </div>
  );
}