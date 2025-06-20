// NOVÝ: src/app/auth/reset-password/ResetPasswordForm.tsx
// Podporuje manuálne zadanie tokenu

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createPagesBrowserClient();

export default function ResetPasswordForm() {
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
  // const [debugInfo, setDebugInfo] = useState<string[]>([]); // Zakomentované pre produkciu

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message}`;
    // console.log(`[RESET DEBUG] ${logMessage}`); // Zakomentované pre produkciu
    // setDebugInfo(prev => [...prev, logMessage]); // Zakomentované pre produkciu
  };

  useEffect(() => {
    const validateToken = async () => {
      try {
        addDebugLog('=== RESET PASSWORD FORM START ===');
        addDebugLog(`Full URL: ${window.location.href}`);

        // Extrahuj parametre z URL
        const urlToken = searchParams.get('token');
        const urlEmail = searchParams.get('email');
        const code = searchParams.get('code');
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const urlError = searchParams.get('error');

        addDebugLog(`URL params:`);
        addDebugLog(`- token: ${urlToken || 'null'} (length: ${urlToken?.length || 0})`);
        addDebugLog(`- email: ${urlEmail || 'null'}`);
        addDebugLog(`- code: ${code ? `${code.substring(0, 10)}...` : 'null'}`);
        addDebugLog(`- access_token: ${access_token ? 'present' : 'null'}`);
        addDebugLog(`- error: ${urlError || 'null'}`);

        // Ak je v URL token a email, automaticky ich overíme
        if (urlToken && urlEmail) {
          addDebugLog('✅ Found token and email in URL - attempting automatic verification');
          setToken(urlToken);
          setEmail(urlEmail);
          
          // Automaticky overíme token
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              email: urlEmail.trim(),
              token: urlToken.trim(),
              type: 'recovery'
            });

            if (error) {
              addDebugLog(`❌ Auto verification error: ${error.message}`);
              setManualMode(true);
              setError('Automatická validácia zlyhala. Prosím, kliknite na "Overiť kód" nižšie.');
            } else if (data.session) {
              addDebugLog('✅ Auto verification successful!');
              addDebugLog(`User: ${data.session.user.email}`);
              setTokenValidated(true);
              setManualMode(false);
              // Vyčisti URL params
              window.history.replaceState(null, '', window.location.pathname);
            } else {
              addDebugLog('❌ No session after auto verification');
              setManualMode(true);
              setError('Nepodarilo sa vytvoriť session. Kliknite na "Overiť kód" pre manuálne overenie.');
            }
          } catch (err: any) {
            addDebugLog(`❌ Auto verification exception: ${err.message}`);
            setManualMode(true);
            setError('Chyba pri automatickom overení. Kliknite na "Overiť kód" pre manuálne overenie.');
          }
        }
        // Ak je chyba, prejdeme na manuálny režim
        else if (urlError) {
          addDebugLog(`❌ Error in URL: ${urlError}`);
          setManualMode(true);
          setError('Link expiroval. Prosím, zadajte kód z emailu manuálne.');
        }
        // Skúsime automatickú validáciu s parametrami z URL
        else if (code || access_token) {
          addDebugLog('🔄 Trying automatic validation...');
          
          let sessionCreated = false;

          // Magic link
          if (access_token && refresh_token) {
            try {
              const { data, error } = await supabase.auth.setSession({
                access_token,
                refresh_token
              });

              if (!error && data.session) {
                addDebugLog('✅ Magic link session created');
                sessionCreated = true;
              }
            } catch (err: any) {
              addDebugLog(`❌ Magic link failed: ${err.message}`);
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
                addDebugLog('✅ OTP verification successful');
                sessionCreated = true;
              }
            } catch (err: any) {
              addDebugLog(`❌ OTP failed: ${err.message}`);
            }
          }

          if (sessionCreated) {
            setTokenValidated(true);
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            addDebugLog('❌ Automatic validation failed, switching to manual mode');
            setManualMode(true);
            setError('Automatická validácia zlyhala. Prosím, zadajte kód z emailu manuálne.');
          }
        }
        // Žiadne parametre - manuálny režim
        else {
          addDebugLog('ℹ️ No URL params, switching to manual mode');
          setManualMode(true);
        }

      } catch (err: any) {
        addDebugLog(`💥 ERROR: ${err.message}`);
        setError(err.message);
        setManualMode(true);
      } finally {
        addDebugLog('🏁 Validation finished');
        setValidating(false);
      }
    };

    validateToken();
  }, [searchParams]);

  const handleManualVerification = async () => {
    if (!token || !email) {
      setError('Prosím, zadajte kód aj email adresu.');
      return;
    }

    setLoading(true);
    setError(null);
    addDebugLog('🔄 Starting manual token verification...');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'recovery'
      });

      if (error) {
        addDebugLog(`❌ Manual verification error: ${error.message}`);
        throw error;
      }

      if (!data.session) {
        throw new Error('Nepodarilo sa vytvoriť session.');
      }

      addDebugLog('✅ Manual verification successful!');
      addDebugLog(`User: ${data.session.user.email}`);
      
      setTokenValidated(true);
      setManualMode(false);

    } catch (err: any) {
      addDebugLog(`💥 Manual verification error: ${err.message}`);
      
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
    addDebugLog('🔄 Starting password update...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expirovala. Prosím, použite nový odkaz na obnovu hesla.');
      }

      addDebugLog(`✅ Session confirmed for: ${session.user.email}`);

      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        addDebugLog(`❌ Password update error: ${error.message}`);
        throw error;
      }

      addDebugLog('🎉 Password updated successfully!');
      setSuccess('Heslo bolo úspešne zmenené! Môžete sa teraz prihlásiť v aplikácii s novým heslom.');
      
      // Odhlásiť používateľa po úspešnej zmene hesla
      await supabase.auth.signOut();
      addDebugLog('👋 User signed out');

    } catch (err: any) {
      addDebugLog(`💥 Password update error: ${err.message}`);
      setError(err.message || 'Nepodarilo sa zmeniť heslo. Skúste to znovu.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Overujem odkaz na obnovu hesla...</p>
        </div>
        
        {/* Debug info - zakomentované pre produkciu */}
        {/* 
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs max-h-40 overflow-y-auto">
          <div className="font-bold mb-2">Debug Info:</div>
          {debugInfo.map((info, index) => (
            <div key={index} className="mb-1 font-mono">{info}</div>
          ))}
        </div>
        */}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Obnova hesla</h1>

      {/* Debug info - zakomentované pre produkciu */}
      {/* 
      <details className="mb-4 p-3 bg-gray-100 rounded">
        <summary className="cursor-pointer text-sm font-bold">Debug Log</summary>
        <div className="mt-2 text-xs max-h-40 overflow-y-auto">
          {debugInfo.map((info, index) => (
            <div key={index} className="mb-1 font-mono">{info}</div>
          ))}
        </div>
      </details>
      */}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="block font-medium">{error}</span>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Úspech!</span>
          </div>
          <span className="block">{success}</span>
          <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
            <p className="text-sm font-medium text-green-800">Ďalšie kroky:</p>
            <ol className="mt-2 text-sm text-green-700 list-decimal list-inside space-y-1">
              <li>Otvorte si mobilnú aplikáciu Lectio Divina</li>
              <li>Prihláste sa s vaším emailom a novým heslom</li>
              <li>Túto stránku môžete zatvoriť</li>
            </ol>
          </div>
        </div>
      )}

      {/* Manuálne zadanie tokenu - len ak automatické zlyhalo */}
      {manualMode && !tokenValidated && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Overenie kódu</h3>
            <p className="text-sm text-blue-700">
              {token && email ? 
                'Automatické overenie zlyhalo. Kliknite na "Overiť kód" pre manuálne overenie.' :
                'Zadajte 6-miestny kód z emailu a vašu email adresu.'
              }
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email adresa
            </label>
            <input
              id="email"
              type="email"
              placeholder="váš@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
              6-miestny kód z emailu
            </label>
            <input
              id="token"
              type="text"
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
              required
              disabled={loading}
              maxLength={6}
            />
          </div>

          <button
            onClick={handleManualVerification}
            disabled={loading || !token || !email || token.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            {loading ? 'Overujem...' : (token && email ? 'Overiť kód' : 'Overiť kód')}
          </button>
        </div>
      )}

      {/* Formulár na zmenu hesla */}
      {tokenValidated && !success && (
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">Kód bol úspešne overený! Teraz zadajte nové heslo.</span>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nové heslo
            </label>
            <input
              id="password"
              type="password"
              placeholder="Zadajte nové heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
            <div className="mt-1 text-xs text-gray-500">
              Heslo musí obsahovať aspoň 8 znakov, veľké a malé písmeno, číslicu a špeciálny znak.
            </div>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Potvrdiť nové heslo
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Potvrďte nové heslo"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            {loading ? 'Zapisujem...' : 'Zmeniť heslo'}
          </button>
        </form>
      )}

      {/* Ak nič nefunguje */}
      {!manualMode && !tokenValidated && !validating && (
        <div className="text-center mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-700">Link na obnovenie hesla expiroval alebo bol už použitý.</p>
          </div>
          
          <button
            onClick={() => setManualMode(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 mb-2"
          >
            Zadať kód manuálne
          </button>
          
          <button
            onClick={() => router.push('/auth/forgot-password')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            Požiadať o nový email
          </button>
        </div>
      )}
    </div>
  );
}