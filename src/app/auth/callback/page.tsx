"use client";
import { useEffect, useState } from "react";
import { useSupabase } from "../../components/SupabaseProvider"; // ← ZMENA: náš provider
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { callbackTranslations } from "./translations";

export default function AuthCallbackPage() {
  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
  const router = useRouter();
  const { lang } = useLanguage();
  const t = callbackTranslations[lang];
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Spracovanie OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data?.session?.user?.email) {
          // Kontrola role v databáze
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, full_name")
            .eq("email", data.session.user.email)
            .single();

          if (userError) {
            // Ak používateľ nie je v databáze, vytvor záznam s user rolou
            const { error: insertError } = await supabase
              .from("users")
              .insert([{
                email: data.session.user.email,
                full_name: data.session.user.user_metadata?.full_name || 
                          data.session.user.user_metadata?.name || 
                          data.session.user.email?.split('@')[0],
                avatar_url: data.session.user.user_metadata?.avatar_url || 
                           data.session.user.user_metadata?.picture,
                provider: data.session.user.app_metadata?.provider || 'oauth',
                role: 'user' // Predvolená rola
              }]);

            if (insertError) {
              throw new Error(t.userRecordError);
            }

            // Nový používateľ s user rolou - presmeruj na hlavnú stránku
            setStatus('success');
            setMessage(t.accountCreatedDesc);
            
            setTimeout(() => {
              router.push('/');
            }, 2000);
            return;
          }

          // Úspešné prihlásenie - presmeruj podľa roly
          setStatus('success');
          setMessage(`${t.welcomeBack}, ${userData.full_name || userData.role}! ${t.redirecting}`);
          
          setTimeout(() => {
            if (userData.role === 'admin') {
              router.push('/admin');
            } else {
              router.push('/');
            }
          }, 2000);

        } else {
          throw new Error(t.userInfoError);
        }

      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || t.loginError);
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [supabase, router, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center max-w-md w-full mx-4">
        
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t.completingLogin}
              </h2>
              <p className="text-gray-600 text-sm">
                {t.verifyingPermissions}
              </p>
            </div>
            
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce animation-delay-100"></div>
              <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce animation-delay-200"></div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-green-600">
                {t.loginSuccessful}
              </h2>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <Loader2 size={16} className="text-green-600 animate-spin" />
              <span className="text-sm text-green-600">{t.redirecting}</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-red-600">
                {t.accessDenied}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 text-left">
                  <p className="font-medium mb-1">{t.whatYouCanDo}</p>
                  <ul className="space-y-1">
                    <li>• {t.contactAdmin}</li>
                    <li>• {t.requestAdminRole}</li>
                    <li>• {t.verifyCorrectAccount}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <Loader2 size={16} className="text-gray-400 animate-spin" />
              <span className="text-sm text-gray-500">{t.redirectingToLogin}</span>
            </div>
          </div>
        )}
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