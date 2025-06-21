"use client";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff, 
  Shield, 
  Github, 
  Chrome,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";

export default function LoginPage() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'social'>('email');

  useEffect(() => {
    if (session !== undefined && session) {
      router.replace("/admin");
    }
  }, [session, router]);

  if (session === undefined) {
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
              Načítavam prihlásenie
            </h2>
            <p className="text-gray-600 text-sm">Kontrolujem váš účet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    // Kontrola role v databáze
    if (authData?.user?.email) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("email", authData.user.email)
        .single();

      setLoading(false);

      if (userError) {
        setError("Chyba pri kontrole oprávnení. Kontaktujte administrátora.");
        await supabase.auth.signOut();
        return;
      }

      if (!userData || userData.role !== "admin") {
        setError("Nemáte oprávnenie na prístup do administrácie. Iba admin užívatelia môžu pristupovať.");
        await supabase.auth.signOut();
        return;
      }

      // Úspešné prihlásenie s admin rolou
      router.push("/admin");
    } else {
      setLoading(false);
      setError("Nepodarilo sa overiť používateľa.");
      await supabase.auth.signOut();
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    }
    // Note: Kontrola role bude vykonaná v callback handleri
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Hlavička */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
          <Shield size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Vitajte späť! 👋
        </h1>
        <p className="text-gray-600">
          Prihláste sa do administračného rozhrania
        </p>
      </div>

      {/* Login Type Selector */}
      <div className="bg-gray-100 rounded-xl p-1 mb-6">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setLoginType('email')}
            className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              loginType === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail size={16} className="inline mr-2" />
            Email
          </button>
          <button
            onClick={() => setLoginType('social')}
            className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              loginType === 'social'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Chrome size={16} className="inline mr-2" />
            Sociálne siete
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-800 font-medium">Chyba prihlásenia</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {loginType === 'email' ? (
        /* Email Login Form */
        <form onSubmit={handleLogin} className="space-y-6">
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
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <Lock size={16} className="mr-2" />
              Heslo
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Zapamätať si ma</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Zabudli ste heslo?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Prihlasovanie...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <LogIn size={18} />
                <span>Prihlásiť sa</span>
              </div>
            )}
          </button>
        </form>
      ) : (
        /* Social Login Options */
        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all duration-200 disabled:opacity-50"
          >
            <Chrome size={20} className="text-red-500" />
            <span className="font-medium text-gray-700">Pokračovať s Google</span>
          </button>

          <button
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition-all duration-200 disabled:opacity-50"
          >
            <Github size={20} />
            <span className="font-medium">Pokračovať s GitHub</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">alebo</span>
            </div>
          </div>

          <button
            onClick={() => setLoginType('email')}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all duration-200"
          >
            <div className="flex items-center justify-center space-x-2">
              <Mail size={18} className="text-gray-600" />
              <span className="font-medium text-gray-700">Prihlásiť sa emailom</span>
            </div>
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <CheckCircle2 size={16} className="text-green-500" />
          <span className="text-sm text-gray-600">Zabezpečené SSL pripojenie</span>
        </div>
        
        <p className="text-xs text-gray-500">
          Prihlásením súhlasíte s našimi{" "}
          <button className="text-blue-600 hover:text-blue-800 underline">
            podmienkami používania
          </button>{" "}
          a{" "}
          <button className="text-blue-600 hover:text-blue-800 underline">
            ochranou osobných údajov
          </button>
        </p>
      </div>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Shield size={16} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">Demo prístup (iba admin)</span>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <p><strong>Email:</strong> admin@example.com</p>
          <p><strong>Heslo:</strong> password123</p>
          <p className="text-blue-600 font-medium mt-2">⚠️ Iba používatelia s rolou "admin" môžu pristupovať</p>
        </div>
      </div>

      {/* Admin Access Warning */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <p className="font-medium mb-1">Obmedzený prístup</p>
            <p>
              Toto je administračné rozhranie. Prístup majú iba používatelia 
              s admin rolou v databáze. Ak nemáte oprávnenie, kontaktujte 
              správcu systému.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}