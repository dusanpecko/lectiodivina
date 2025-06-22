'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '../../components/SupabaseProvider'; // ← ZMENA: náš provider
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
  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
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

      setMessage('Na váš email bol odoslaný odkaz na obnovenie hesla. Skontrolujte si doručenú poštu a spam.');
      setEmailSent(true);
      setEmail('');
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Nepodarilo sa odoslať email. Skontrolujte emailovú adresu a skúste znovu.');
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
      <div className="w-full max-w-md mx-auto">
        {/* Success State */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email odoslaný! 📧
          </h1>
          <p className="text-gray-600">
            Skontrolujte si doručenú poštu
          </p>
        </div>

        {/* Success Message */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium mb-1">Email úspešne odoslaný</p>
              <p className="text-green-700 text-sm leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Mail size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">Ďalšie kroky:</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Otvorte si emailovú schránku</li>
                <li>Nájdite email s obnovením hesla</li>
                <li>Kliknite na odkaz v emaili</li>
                <li>Nastavte si nové heslo</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Warning about spam */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium mb-1">Nevidíte email?</p>
              <ul className="space-y-1">
                <li>• Skontrolujte spam/nevyžiadanú poštu</li>
                <li>• Počkajte 2-3 minúty</li>
                <li>• Overte správnosť emailovej adresy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-2">
              <Send size={18} />
              <span>Odoslať znovu</span>
            </div>
          </button>

          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all duration-200 font-medium text-gray-700"
          >
            <ArrowLeft size={18} />
            <span>Späť na prihlásenie</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg mb-4">
          <Key size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Zabudli ste heslo? 🔑
        </h1>
        <p className="text-gray-600">
          Pošleme vám odkaz na obnovenie hesla
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-800 font-medium">Chyba odosielania</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <Mail size={16} className="mr-2" />
            Emailová adresa
          </label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              disabled={loading}
            />
            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500">
            Zadajte email, ktorý používate na prihlásenie do administrácie
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 focus:ring-4 focus:ring-orange-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 size={18} className="animate-spin" />
              <span>Odosielam email...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Send size={18} />
              <span>Odoslać obnovovací email</span>
            </div>
          )}
        </button>
      </form>

      {/* Back to login */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Späť na prihlásenie</span>
        </Link>
      </div>

      {/* Security info */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield size={16} className="text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Bezpečnostné informácie</p>
            <p>
              Odkaz na obnovenie hesla bude platný 1 hodinu. 
              Ak email nedostanete, skontrolujte spam a skúste znovu.
            </p>
          </div>
        </div>
      </div>

      {/* Help section */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Stále máte problémy?{" "}
          <button className="text-blue-600 hover:text-blue-800 underline">
            Kontaktujte podporu
          </button>
        </p>
      </div>
    </div>
  );
}