'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '../../components/SupabaseProvider'; // ← ZMENA: náš provider
import { 
  Key, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Shield,
  ArrowLeft,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function ResetPasswordForm() {
  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
  const router = useRouter();
  const searchParams = useSearchParams();
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
        const urlToken = searchParams.get('token');
        const urlEmail = searchParams.get('email');
        const code = searchParams.get('code');
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const urlError = searchParams.get('error');

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
              setError('Automatická validácia zlyhala. Prosím, kliknite na "Overiť kód" nižšie.');
            } else if (data.session) {
              setTokenValidated(true);
              setManualMode(false);
              window.history.replaceState(null, '', window.location.pathname);
            } else {
              setManualMode(true);
              setError('Nepodarilo sa vytvoriť session. Kliknite na "Overiť kód" pre manuálne overenie.');
            }
          } catch (err: any) {
            setManualMode(true);
            setError('Chyba pri automatickom overení. Kliknite na "Overiť kód" pre manuálne overenie.');
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
            setError('Automatická validácia zlyhala. Prosím, zadajte kód z emailu manuálne.');
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
      setError('Prosím, zadajte kód aj email adresu.');
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
        throw new Error('Nepodarilo sa vytvoriť session.');
      }
      
      setTokenValidated(true);
      setManualMode(false);

    } catch (err: any) {
      let errorMessage = err.message;
      if (errorMessage.includes('Token has expired')) {
        errorMessage = 'Kód expiroval. Prosím, požiadajte o nový email na obnovenie hesla.';
      } else if (errorMessage.includes('Invalid token')) {
        errorMessage = 'Neplatný kód. Skontrolujte, že ste zadali správny kód z emailu.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (value: string): string | null => {
    if (value.length < 8) return 'Heslo musí mať aspoň 8 znakov.';
    if (!/[a-z]/.test(value)) return 'Heslo musí obsahovať malé písmeno.';
    if (!/[A-Z]/.test(value)) return 'Heslo musí obsahovať veľké písmeno.';
    if (!/[0-9]/.test(value)) return 'Heslo musí obsahovať číslicu.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Heslo musí obsahovať špeciálny znak.';
    return null;
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    if (score < 2) return { level: 'weak', color: 'red', text: 'Slabé' };
    if (score < 4) return { level: 'medium', color: 'yellow', text: 'Stredné' };
    return { level: 'strong', color: 'green', text: 'Silné' };
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
      setError('Heslá sa nezhodujú.');
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expirovala. Prosím, použite nový odkaz na obnovu hesla.');
      }

      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        throw error;
      }

      setSuccess('Heslo bolo úspešne zmenené! Môžete sa teraz prihlásiť s novým heslom.');
      
      // Odhlásiť používateľa po úspešnej zmene hesla
      await supabase.auth.signOut();

    } catch (err: any) {
      setError(err.message || 'Nepodarilo sa zmeniť heslo. Skúste to znovu.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  if (validating) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Key size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Overujem odkaz 🔍
          </h1>
          <p className="text-gray-600">
            Kontrolujem platnosť vašeho odkazu...
          </p>
        </div>

        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
          </div>
          
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
          <Lock size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nastavenie nového hesla 🔒
        </h1>
        <p className="text-gray-600">
          Vytvorte si bezpečné nové heslo
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium mb-1">Chyba</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium mb-1">Úspech!</p>
              <p className="text-green-700 text-sm mb-3">{success}</p>
              
              <div className="p-3 bg-green-100 rounded border border-green-200">
                <p className="text-sm font-medium text-green-800 mb-2">Ďalšie kroky:</p>
                <ol className="text-sm text-green-700 list-decimal list-inside space-y-1">
                  <li>Otvorte si aplikáciu</li>
                  <li>Prihláste sa s novým heslom</li>
                  <li>Túto stránku môžete zatvoriť</li>
                </ol>
              </div>
              
              <div className="mt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-2 text-green-700 hover:text-green-900 font-medium transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Prejsť na prihlásenie</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Token Verification */}
      {manualMode && !tokenValidated && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Clock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">Overenie kódu</h3>
                <p className="text-sm text-blue-700">
                  {token && email ? 
                    'Automatické overenie zlyhalo. Kliknite na "Overiť kód" pre manuálne overenie.' :
                    'Zadajte 6-miestny kód z emailu a vašu email adresu.'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Mail size={16} className="mr-2" />
                Email adresa
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="váš@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  disabled={loading}
                />
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Key size={16} className="mr-2" />
                6-miestny kód z emailu
              </label>
              <input
                type="text"
                placeholder="123456"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono transition-all duration-200"
                disabled={loading}
                maxLength={6}
              />
            </div>

            <button
              onClick={handleManualVerification}
              disabled={loading || !token || !email || token.length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Overujem...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Shield size={18} />
                  <span>Overiť kód</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Password Reset Form */}
      {tokenValidated && !success && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle2 size={20} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Kód bol úspešne overený! Teraz zadajte nové heslo.
              </span>
            </div>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Lock size={16} className="mr-2" />
                Nové heslo
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Zadajte nové heslo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  disabled={loading}
                />
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password Requirements */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Heslo musí obsahovať:</p>
                <ul className="space-y-1 ml-2">
                  <li className={`flex items-center space-x-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{password.length >= 8 ? '✓' : '○'}</span>
                    <span>Aspoň 8 znakov</span>
                  </li>
                  <li className={`flex items-center space-x-1 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{/[a-z]/.test(password) ? '✓' : '○'}</span>
                    <span>Malé písmeno</span>
                  </li>
                  <li className={`flex items-center space-x-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                    <span>Veľké písmeno</span>
                  </li>
                  <li className={`flex items-center space-x-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{/[0-9]/.test(password) ? '✓' : '○'}</span>
                    <span>Číslicu</span>
                  </li>
                  <li className={`flex items-center space-x-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'}</span>
                    <span>Špeciálny znak</span>
                  </li>
                </ul>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Sila hesla:</span>
                    <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${passwordStrength.color}-500 transition-all duration-300`}
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Lock size={16} className="mr-2" />
                Potvrdiť nové heslo
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Potvrďte nové heslo"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  disabled={loading}
                />
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className={`text-xs flex items-center space-x-1 ${
                  password === confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>{password === confirmPassword ? '✓' : '✗'}</span>
                  <span>{password === confirmPassword ? 'Heslá sa zhodujú' : 'Heslá sa nezhodujú'}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Zapisujem heslo...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 size={18} />
                  <span>Zmeniť heslo</span>
                </div>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Fallback Options */}
      {!manualMode && !tokenValidated && !validating && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Link expiroval</p>
                <p className="text-sm text-yellow-700">
                  Link na obnovenie hesla expiroval alebo bol už použitý.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setManualMode(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-2">
                <Key size={18} />
                <span>Zadať kód manuálne</span>
              </div>
            </button>
            
            <Link
              href="/auth/forgot-password"
              className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all duration-200 font-medium text-gray-700"
            >
              <RefreshCw size={18} />
              <span>Požiadať o nový email</span>
            </Link>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Späť na prihlásenie</span>
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