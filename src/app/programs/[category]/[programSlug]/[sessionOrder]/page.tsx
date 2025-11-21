"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider";
import {
  ArrowLeft, Heart, Share
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Import new components
import SessionPlayer from "@/app/components/programs/SessionPlayer";

interface Program {
  id: string;
  title: string;
  slug: string;
  category: string;
  author?: string;
  image_url?: string;
  total_sessions: number;
}

interface Session {
  id: string;
  program_id: string;
  title: string;
  description?: string;
  session_order: number;
  duration_minutes: number;
  is_published: boolean;
}

interface SessionMedia {
  id: string;
  session_id: string;
  media_type: 'video' | 'audio' | 'text' | 'image';
  title?: string;
  content: string;
  media_order: number;
  duration_minutes?: number;
  thumbnail_url?: string;
  is_published: boolean;
}

export default function SessionPlayerPage() {
  const { supabase } = useSupabase();
  const { lang: appLang } = useLanguage();
  const params = useParams();
  const router = useRouter();
  
  const category = params?.category ? String(params.category) : "";
  const programSlug = params?.programSlug ? String(params.programSlug) : "";
  const sessionOrder = params?.sessionOrder ? parseInt(String(params.sessionOrder)) : 0;
  
  const [program, setProgram] = useState<Program | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [sessionMedia, setSessionMedia] = useState<SessionMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch program and session data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch program
        const { data: programData, error: programError } = await supabase
          .from("programs")
          .select("id, title, slug, category, author, image_url, total_sessions")
          .eq("slug", programSlug)
          .eq("category", category)
          .eq("is_published", true)
          .eq("lang", appLang)
          .single();

        if (programError) {
          if (programError.code === 'PGRST116') {
            setError('Program sa nenašiel');
          } else {
            throw programError;
          }
          return;
        }

        setProgram(programData);

        // Fetch all sessions for navigation
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("program_sessions")
          .select("*")
          .eq("program_id", programData.id)
          .eq("is_published", true)
          .order("session_order");

        if (sessionsError) throw sessionsError;
        setAllSessions(sessionsData || []);

        // Find current session
        const currentSession = sessionsData?.find(s => s.session_order === sessionOrder);
        if (!currentSession) {
          setError('Lekcia sa nenašla');
          return;
        }

        setSession(currentSession);

        // Fetch session media
        const { data: mediaData, error: mediaError } = await supabase
          .from("session_media")
          .select("*")
          .eq("session_id", currentSession.id)
          .eq("is_published", true)
          .order("media_order");

        if (mediaError) throw mediaError;
        setSessionMedia(mediaData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Nepodarilo sa načítať lekciu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, programSlug, category, sessionOrder, appLang]);

  // Load bookmark status from localStorage
  useEffect(() => {
    if (!session) return;
    
    const bookmarked = localStorage.getItem('bookmarkedSessions');
    if (bookmarked) {
      const bookmarkedArray = JSON.parse(bookmarked);
      setIsBookmarked(bookmarkedArray.includes(session.id));
    }
  }, [session]);

  // Handle session change
  const handleSessionChange = (sessionOrder: number) => {
    router.push(`/programs/${program?.category}/${program?.slug}/${sessionOrder}`);
  };

  // Handle session bookmarking
  const handleSessionBookmark = () => {
    if (!session) return;
    
    const bookmarked = localStorage.getItem('bookmarkedSessions');
    const current = bookmarked ? JSON.parse(bookmarked) : [];
    
    let updated;
    if (current.includes(session.id)) {
      updated = current.filter((id: string) => id !== session.id);
      setIsBookmarked(false);
    } else {
      updated = [...current, session.id];
      setIsBookmarked(true);
    }
    
    localStorage.setItem('bookmarkedSessions', JSON.stringify(updated));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 font-medium">Načítavam lekciu...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !program || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-6">😔</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {error || 'Lekcia sa nenašla'}
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Lekcia, ktorú hľadáte, neexistuje alebo nie je dostupná. Možno bola odstránená alebo ste zadali nesprávne číslo lekcie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Späť
            </button>
            {program && (
              <Link href={`/programs/${program.category}/${program.slug}`}>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Všetky lekcie
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/programs/${program.category}/${program.slug}`}>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <ArrowLeft size={20} />
                </button>
              </Link>
              
              <div>
                <h1 className="font-semibold text-gray-900">{program.title}</h1>
                <p className="text-sm text-gray-600">
                  Lekcia {session.session_order}: {session.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleSessionBookmark}
                className={`p-2 rounded-lg transition ${
                  isBookmarked 
                    ? 'text-yellow-600 bg-yellow-100' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Heart size={20} className={isBookmarked ? 'fill-current' : ''} />
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Share size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Session Player - Main Content */}
          <div className="xl:col-span-3">
            <SessionPlayer
              session={session}
              sessionMedia={sessionMedia}
              program={program}
              allSessions={allSessions}
              onSessionChange={handleSessionChange}
              autoPlayNext={true}
              showNotes={true}
              bookmarkedSessions={(() => {
                const saved = localStorage.getItem('bookmarkedSessions');
                return saved ? JSON.parse(saved) : [];
              })()}
              onBookmark={handleSessionBookmark}
            />
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Program Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">O programe</h3>
              
              {program.image_url && (
                <div className="relative w-full h-32 mb-4">
                  <Image 
                    src={program.image_url} 
                    alt={program.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              
              <h4 className="font-medium text-gray-900 mb-2">{program.title}</h4>
              
              {program.author && (
                <p className="text-sm text-gray-600 mb-4">od {program.author}</p>
              )}
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Celkom lekcií:</span>
                  <span className="font-medium">{program.total_sessions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aktuálna lekcia:</span>
                  <span className="font-medium">{session.session_order}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href={`/programs/${program.category}/${program.slug}`}>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Všetky lekcie
                  </button>
                </Link>
              </div>
            </div>

            {/* Session Navigation Quick Links */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Navigácia</h3>
              
              <div className="space-y-3">
                {/* Previous Session */}
                {session.session_order > 1 && (
                  <Link href={`/programs/${program.category}/${program.slug}/${session.session_order - 1}`}>
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Predchádzajúca</div>
                        <div className="text-xs text-gray-600">Lekcia {session.session_order - 1}</div>
                      </div>
                      <ArrowLeft size={16} className="text-gray-400" />
                    </button>
                  </Link>
                )}
                
                {/* Next Session */}
                {session.session_order < program.total_sessions && (
                  <Link href={`/programs/${program.category}/${program.slug}/${session.session_order + 1}`}>
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-left">
                      <div>
                        <div className="text-sm font-medium text-blue-900">Ďalšia lekcia</div>
                        <div className="text-xs text-blue-700">Lekcia {session.session_order + 1}</div>
                      </div>
                      <ArrowLeft size={16} className="text-blue-400 rotate-180" />
                    </button>
                  </Link>
                )}
                
                {/* Back to Program */}
                <Link href={`/programs/${program.category}/${program.slug}`}>
                  <button className="w-full px-4 py-3 border border-gray-200 hover:border-gray-300 rounded-lg transition text-center text-sm font-medium text-gray-700">
                    Všetky lekcie programu
                  </button>
                </Link>
              </div>
            </div>

            {/* Related Programs Teaser */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2">Pokračovať v učení</h3>
              <p className="text-sm text-gray-600 mb-4">
                Objavte ďalšie programy pre váš duchovný rast
              </p>
              <Link href="/programs">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  Preskúmať programy
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}