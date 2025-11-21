'use client';

import { useLanguage } from '@/app/components/LanguageProvider';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Eye,
    EyeOff,
    Key,
    Loader2,
    Lock,
    Mail,
    RefreshCw,
    Shield
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSupabase } from '../../components/SupabaseProvider'; // ← ZMENA: náš provider
import { resetPasswordTranslations } from './translations';

export default function ResetPasswordForm() {
  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const t = resetPasswordTranslations[lang];
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [validating, setValidating] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Extrahuj parametre z URL
        const urlToken = searchParams?.get('token');
        const urlEmail = searchParams?.get('email');
        const code = searchParams?.get('code');
        const access_token = searchParams?.get('access_token');
        const refresh_token = searchParams?.get('refresh_token');
        const urlError = searchParams?.get('error');

        // Ak je v URL token a email, automaticky ich overíme
        if (urlToken && urlEmail) {
          setToken(urlToken);
          setEmail(urlEmail);
          
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              email: urlEmail.trim(),
              token: urlToken.trim(),
              type: 'recovery'
            });

            if (error) {
              setManualMode(true);
              setError(t.autoValidationFailed);
            } else if (data.session) {
              setTokenValidated(true);
              setManualMode(false);
              window.history.replaceState(null, '', window.location.pathname);
            } else {
              setManualMode(true);
              setError(t.sessionFailed);
            }
          } catch (err: any) {
            setManualMode(true);
            setError(t.autoValidationFailed);
          }
        }
        // Ak je chyba, prejdeme na manuálny režim
        else if (urlError) {
          setManualMode(true);
          setError('Link expiroval alebo je neplatný. Prosím, zadajte kód z emailu manuálne.');
        }
        // Skúsime automatickú validáciu s parametrami z URL
        else if (code || access_token) {
          let sessionCreated = false;

          // Magic link
          if (access_token && refresh_token) {
            try {
              const { data, error } = await supabase.auth.setSession({
                access_token,
                refresh_token
              });

              if (!error && data.session) {
                sessionCreated = true;
              }
            } catch (err: any) {
              // Silent fail
            }
          }

          // OTP token
          if (!sessionCreated && code) {
            try {
              const { data, error } = await supabase.auth.verifyOtp({
                token_hash: code,
                type: 'recovery'
              });

              if (!error && data.session) {
                sessionCreated = true;
              }
            } catch (err: any) {
              // Silent fail
            }
          }

          if (sessionCreated) {
            setTokenValidated(true);
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            setManualMode(true);
            setError(t.linkExpiredManual);
          }
        }
        // Žiadne parametre - manuálny režim
        else {
          setManualMode(true);
        }

      } catch (err: any) {
        setError(err.message);
        setManualMode(true);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [searchParams, supabase]);

  const handleManualVerification = async () => {
    if (!token || !email) {
      setError(t.enterCodeAndEmail);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'recovery'
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error(t.sessionFailed);
      }
      
      setTokenValidated(true);
      setManualMode(false);

    } catch (err: any) {
      let errorMessage = err.message;
      if (errorMessage.includes('Token has expired')) {
        errorMessage = t.tokenExpired;
      } else if (errorMessage.includes('Invalid token')) {
        errorMessage = t.invalidToken;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (value: string): string | null => {
    if (value.length < 8) return t.passwordMinLength;
    if (!/[a-z]/.test(value)) return t.passwordLowercase;
    if (!/[A-Z]/.test(value)) return t.passwordUppercase;
    if (!/[0-9]/.test(value)) return t.passwordNumber;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return t.passwordSpecialChar;
    return null;
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    if (score < 2) return { level: 'weak', color: 'red', text: t.weak };
    if (score < 4) return { level: 'medium', color: 'yellow', text: t.medium };
    return { level: 'strong', color: 'green', text: t.strong };
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = validatePassword(password);
    if (validation) {
      setError(validation);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error(t.sessionExpired);
      }

      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        throw error;
      }

      setSuccess(t.passwordChangedDesc);
      
      // Odhlásiť používateľa po úspešnej zmene hesla
      await supabase.auth.signOut();

    } catch (err: any) {
      setError(err.message || t.unknownError);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  if (validating) {
    return (
      <div className="w-full">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg shadow-lg mb-2" style={{ backgroundColor: '#686ea3' }}>
            <Key size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-0.5">
            {t.verifyingLink}
          </h1>
          <p className="text-white/70 text-xs">
            {t.checkingValidity}
          </p>
        </div>

        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          </div>
          
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg shadow-lg mb-2" style={{ backgroundColor: '#686ea3' }}>
          <Lock size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white mb-0.5">
          {t.setNewPassword}
        </h1>
        <p className="text-white/70 text-xs">
          {t.createSecurePassword}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-red-800 font-medium text-sm">{t.errorOccurred}</span>
          </div>
          <p className="text-red-700 text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-3 p-3 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium text-sm mb-0.5">{t.passwordChanged}</p>
              <p className="text-green-700 text-xs mb-2">{success}</p>
              
              <div className="mt-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 font-semibold text-white text-sm hover:opacity-90"
                  style={{ backgroundColor: '#686ea3' }}
                >
                  <ArrowLeft size={16} />
                  <span>{t.backToLogin}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Token Verification */}
      {manualMode && !tokenValidated && (
        <div className="space-y-4">
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Clock size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-0.5">{t.enterCode}</h3>
                <p className="text-xs text-blue-700">
                  {token && email ? t.linkExpiredManual : t.linkExpiredManual}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90 flex items-center">
                <Mail size={14} className="mr-1.5" />
                {t.emailAddress}
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 pl-9 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all duration-200 text-white placeholder-white/50 text-sm"
                  disabled={loading}
                />
                <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90 flex items-center">
                <Key size={14} className="mr-1.5" />
                {t.codeFromEmail}
              </label>
              <input
                type="text"
                placeholder={t.codePlaceholder}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-white/40 focus:border-white/40 text-center text-xl tracking-widest font-mono transition-all duration-200 text-white placeholder-white/50"
                disabled={loading}
                maxLength={6}
              />
            </div>

            <button
              onClick={handleManualVerification}
              disabled={loading || !token || !email || token.length !== 6}
              className="w-full text-white py-2.5 px-4 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
              style={{ backgroundColor: '#686ea3' }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>{t.verifying}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Shield size={18} />
                  <span>{t.verifyCode}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Password Reset Form */}
      {tokenValidated && !success && (
        <div className="space-y-4">
          <form onSubmit={handlePasswordReset} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90 flex items-center">
                <Lock size={14} className="mr-1.5" />
                {t.newPassword}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pl-9 pr-9 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all duration-200 text-white placeholder-white/50 text-sm"
                  disabled={loading}
                />
                <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Password Requirements */}
              <div className="text-xs text-white/60 space-y-1">
                <p className="font-medium">{t.passwordRequirements}</p>
                <ul className="space-y-0.5 ml-2">
                  <li className={`flex items-center space-x-1 ${password.length >= 8 ? 'text-green-400' : 'text-white/40'}`}>
                    <span>{password.length >= 8 ? '✓' : '○'}</span>
                    <span>{t.minLength}</span>
                  </li>
                  <li className={`flex items-center space-x-1 ${/[a-z]/.test(password) ? 'text-green-400' : 'text-white/40'}`}>
                    <span>{/[a-z]/.test(password) ? '✓' : '○'}</span>
                    <span>{t.lowercase}</span>
                  </li>
                  <li className={`flex items-center space-x-1 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-white/40'}`}>
                    <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                    <span>{t.uppercase}</span>
                  </li>
                  <li className={`flex items-center space-x-1 ${/[0-9]/.test(password) ? 'text-green-400' : 'text-white/40'}`}>
                    <span>{/[0-9]/.test(password) ? '✓' : '○'}</span>
                    <span>{t.number}</span>
                  </li>
                  <li className={`flex items-center space-x-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-400' : 'text-white/40'}`}>
                    <span>{/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'}</span>
                    <span>{t.specialChar}</span>
                  </li>
                </ul>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{t.passwordStrength}</span>
                    <span className={`text-xs font-medium text-${passwordStrength.color}-400`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full bg-${passwordStrength.color}-400 transition-all duration-300`}
                      style={{ 
                        width: passwordStrength.level === 'weak' ? '33%' : 
                               passwordStrength.level === 'medium' ? '66%' : '100%' 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90 flex items-center">
                <Lock size={14} className="mr-1.5" />
                {t.confirmPassword}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pl-9 pr-9 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all duration-200 text-white placeholder-white/50 text-sm"
                  disabled={loading}
                />
                <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className={`text-xs flex items-center space-x-1 ${
                  password === confirmPassword ? 'text-green-400' : 'text-red-400'
                }`}>
                  <span>{password === confirmPassword ? '✓' : '✗'}</span>
                  <span>{password === confirmPassword ? t.passwordsMatch : t.passwordMismatch}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full text-white py-2.5 px-4 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
              style={{ backgroundColor: '#686ea3' }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>{t.resetting}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 size={18} />
                  <span>{t.resetPassword}</span>
                </div>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Fallback Options */}
      {!manualMode && !tokenValidated && !validating && (
        <div className="space-y-4">
          <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 mb-0.5">{t.linkExpired}</p>
                <p className="text-xs text-amber-700">
                  {t.linkExpiredManual}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setManualMode(true)}
              className="w-full text-white py-2.5 px-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              style={{ backgroundColor: '#686ea3' }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Key size={16} />
                <span>{t.enterCodeManually}</span>
              </div>
            </button>
            
            <Link
              href="/auth/forgot-password"
              className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg transition-all duration-200 font-semibold text-white text-sm hover:opacity-90"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <RefreshCw size={16} />
              <span>{t.requestNewEmail}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-4 text-center">
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-white hover:text-white/80 font-medium transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>{t.backToLogin}</span>
        </Link>
      </div>

      <style jsx>{`
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}