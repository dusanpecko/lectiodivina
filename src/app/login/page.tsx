"use client";
import {
  AlertCircle,
  CheckCircle2,
  Chrome,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useLanguage } from "../components/LanguageProvider";
import { useSupabase } from "../components/SupabaseProvider";
import { loginTranslations } from "./translations";

function LoginPageContent() {
  const { supabase, session } = useSupabase();
  const { lang } = useLanguage();
  const t = loginTranslations[lang];
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'social'>('email');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Počkaj na načítanie session
    const timer = setTimeout(() => {
      setIsCheckingSession(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      if (session && !isCheckingSession && supabase) {
        // Skontroluj rolu používateľa
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("email", session.user.email)
          .maybeSingle();

        if (userData?.role === "admin") {
          // Použiť redirect parameter ak existuje, inak predvolené /admin
          router.replace(redirectPath);
        } else {
          // Bežný používateľ ide na hlavnú stránku
          router.replace("/");
        }
      }
    };

    checkSessionAndRedirect();
  }, [session, router, isCheckingSession, supabase, redirectPath]);

  // Loading screen počas kontroly session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t.loadingLogin}
            </h2>
            <p className="text-gray-600 text-sm">{t.checkingAccount}</p>
          </div>
        </div>
      </div>
    );
  }

  // Ak je už prihlásený, nič nezobrazuj (prebieha redirect)
  if (session) {
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    // Validácia
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t.passwordMinLength);
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        throw new Error(t.supabaseUnavailable);
      }

      // Registrácia používateľa
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (authError) {
        setLoading(false);
        
        // Špeciálne správy pre rôzne chyby
        if (authError.message.includes("rate limit")) {
          setError("Príliš veľa pokusov. Počkajte prosím 2 minúty a skúste znova.");
        } else if (authError.message.includes("already registered")) {
          setError("Tento email je už registrovaný. Skúste sa prihlásiť.");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (authData?.user) {
        // DÔLEŽITÉ: Počkáme chvíľu na vytvorenie Auth používateľa
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Skontrolujeme, či používateľ už existuje v users tabuľke
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", authData.user.id)
          .maybeSingle();

        // Vytvoríme záznam len ak neexistuje
        if (!existingUser) {
          const { error: userError } = await supabase
            .from("users")
            .insert([{
              id: authData.user.id,
              email: authData.user.email,
              full_name: fullName || authData.user.email?.split('@')[0],
              role: "user"
            }]);

          if (userError) {
            // Ak je to duplicate email, ignoruj (používateľ už existuje)
            if (userError.code !== '23505') {
              console.error("Error creating user record:", userError);
              setError(`Database error: ${userError.message || "Unknown error"}`);
              setLoading(false);
              return;
            }
          }
        }

        // Odhlásiме používateľa aby sa automaticky neprihlásil
        await supabase.auth.signOut();
        
        setLoading(false);
        setError(null);
        setSuccessMessage(t.registrationSuccess);
        
        // Po 3 sekundách prepneme na prihlásenie
        setTimeout(() => {
          setIsRegister(false);
          setSuccessMessage(null);
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFullName("");
        }, 3000);
      }
    } catch (err) {
      console.error("Register error:", err);
      setLoading(false);
      setError(err instanceof Error ? err.message : t.unknownError);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error(t.supabaseUnavailable);
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setLoading(false);
        setError(authError.message);
        return;
      }

      // Kontrola role v databáze a presmerovanie
      if (authData?.user?.email) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("email", authData.user.email)
          .maybeSingle();

        setLoading(false);

        if (userError) {
          console.error("Error fetching user role:", userError);
          // Ak je chyba pri načítaní role, predpokladáme že je to bežný používateľ
          router.push("/");
          return;
        }

        // Presmerovanie podľa role
        if (userData?.role === "admin") {
          router.push(redirectPath);
        } else {
          // Bežný používateľ alebo neexistujúci záznam v users tabuľke
          router.push("/");
        }
      } else {
        setLoading(false);
        setError(t.userVerificationFailed);
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      setError(err instanceof Error ? err.message : t.unknownError);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error(t.supabaseUnavailable);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      setLoading(false);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error("Social login error:", err);
      setLoading(false);
      setError(err instanceof Error ? err.message : t.unknownError);
    }
  };

  return (
    <div className="w-full">
      {/* Hlavička */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg shadow-lg mb-2" style={{ backgroundColor: '#686ea3' }}>
          <Shield size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white mb-0.5">
          {isRegister ? t.createAccount : t.welcomeBack}
        </h1>
        <p className="text-white/70 text-xs">
          {isRegister ? t.registerSubtitle : t.loginSubtitle}
        </p>
      </div>

      {/* Login Type Selector */}
      <div className="rounded-lg p-0.5 mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
        <div className="grid grid-cols-2 gap-0.5">
          <button
            onClick={() => setLoginType('email')}
            className={`py-1.5 px-3 text-sm rounded-md font-medium transition-all duration-200 ${
              loginType === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Mail size={14} className="inline mr-1.5" />
            {t.emailTab}
          </button>
          <button
            onClick={() => setLoginType('social')}
            className={`py-1.5 px-3 text-sm rounded-md font-medium transition-all duration-200 ${
              loginType === 'social'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Chrome size={14} className="inline mr-1.5" />
            {t.socialTab}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={18} className="text-green-600" />
            <span className="text-green-800 font-medium text-sm">{t.success}</span>
          </div>
          <p className="text-green-700 text-xs mt-1">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle size={18} className="text-red-600" />
            <span className="text-red-800 font-medium text-sm">{t.loginError}</span>
          </div>
          <p className="text-red-700 text-xs mt-1">{error}</p>
        </div>
      )}

      {loginType === 'email' ? (
        /* Email Login/Register Form */
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-3">
          {/* Meno (len pri registrácii) */}
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white flex items-center">
                <Shield size={14} className="mr-1.5" />
                {t.fullName}
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoComplete="name"
                  required
                  placeholder={t.fullNamePlaceholder}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 pl-9 text-sm rounded-lg focus:ring-2 focus:ring-white/50 transition-all duration-200 bg-white/10 border text-white placeholder-white/50"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                  disabled={loading}
                />
                <Shield size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50" />
              </div>
            </div>
          )}


          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white flex items-center">
              <Mail size={14} className="mr-1.5" />
              {t.email}
            </label>
            <div className="relative">
              <input
                type="email"
                autoComplete="email"
                required
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 pl-9 text-sm rounded-lg focus:ring-2 focus:ring-white/50 transition-all duration-200 bg-white/10 border text-white placeholder-white/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                disabled={loading}
              />
              <Mail size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white flex items-center">
              <Lock size={14} className="mr-1.5" />
              {t.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 pl-9 pr-9 text-sm rounded-lg focus:ring-2 focus:ring-white/50 transition-all duration-200 bg-white/10 border text-white placeholder-white/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                disabled={loading}
              />
              <Lock size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Potvrdenie hesla (len pri registrácii) */}
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white flex items-center">
                <Lock size={14} className="mr-1.5" />
                {t.confirmPassword}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder={t.passwordPlaceholder}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pl-9 pr-9 text-sm rounded-lg focus:ring-2 focus:ring-white/50 transition-all duration-200 bg-white/10 border text-white placeholder-white/50"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                  disabled={loading}
                />
                <Lock size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50" />
              </div>
            </div>
          )}

          {/* Remember Me & Forgot Password (len pri prihlásení) */}
          {!isRegister && (
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 text-white border-white/30 rounded focus:ring-white/50 bg-white/10"
              />
              <span className="text-white">{t.rememberMe}</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-white hover:text-white/80 font-medium transition-colors"
            >
              {t.forgotPassword}
            </Link>
          </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !supabase}
            className="w-full text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:opacity-90 focus:ring-4 focus:ring-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#686ea3' }}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 size={18} className="animate-spin" />
                <span>{isRegister ? t.registering : t.loggingIn}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <LogIn size={18} />
                <span>{isRegister ? t.register : t.login}</span>
              </div>
            )}
          </button>

          {/* Toggle medzi prihlásením a registráciou */}
          <div className="text-center text-xs text-white/70">
            {isRegister ? (
              <>
                {t.alreadyHaveAccount}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                    setSuccessMessage(null);
                    setConfirmPassword("");
                    setFullName("");
                  }}
                  className="text-white font-semibold hover:text-white/80 underline"
                >
                  {t.signInHere}
                </button>
              </>
            ) : (
              <>
                {t.noAccount}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-white font-semibold hover:text-white/80 underline"
                >
                  {t.registerHere}
                </button>
              </>
            )}
          </div>
        </form>
      ) : (
        /* Social Login Options - len Google */
        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading || !supabase}
            className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-white/20 transition-all duration-200 disabled:opacity-50 shadow-md"
          >
            <Chrome size={18} className="text-red-500" />
            <span className="font-medium">{t.continueWithGoogle}</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-white/70 text-xs" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>{t.or}</span>
            </div>
          </div>

          <button
            onClick={() => setLoginType('email')}
            className="w-full py-2.5 px-4 border rounded-lg text-sm hover:bg-white/10 focus:ring-4 focus:ring-white/20 transition-all duration-200"
            style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <div className="flex items-center justify-center space-x-2">
              <Mail size={16} className="text-white/80" />
              <span className="font-medium text-white">{t.useEmail}</span>
            </div>
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-1.5 mb-2">
          <CheckCircle2 size={14} className="text-green-400" />
          <span className="text-xs text-white/80">{t.securedConnection}</span>
        </div>
        
        <p className="text-[10px] text-white/60 leading-tight">
          {t.byLoggingIn}{" "}
          <button className="text-white hover:text-white/80 underline">
            {t.termsOfService}
          </button>{" "}
          {t.and}{" "}
          <button className="text-white hover:text-white/80 underline">
            {t.privacyPolicy}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-900 to-teal-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>}>
      <LoginPageContent />
    </Suspense>
  );
}