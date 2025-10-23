"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { formatDate } from "@/utils/dateFormatter";
import {
    ArrowLeft, Video
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Import new components
import ProgramHero from "@/app/components/programs/ProgramHero";
import SessionList from "@/app/components/programs/SessionList";

interface Program {
  id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  image_url?: string;
  author?: string;
  lang: string;
  total_sessions: number;
  total_duration_minutes: number;
  is_featured: boolean;
  is_published: boolean;
  published_at?: string;
  created_at?: string;
}

interface Session {
  id: string;
  program_id: string;
  title: string;
  description?: string;
  session_order: number;
  duration_minutes: number;
  is_published: boolean;
  created_at?: string;
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

// Loading Skeletons
const HeroSkeleton = () => (
  <div className="h-96 lg:h-[500px] bg-gray-300 animate-pulse"></div>
);

// Program Info Section
const ProgramInfo = ({ program }: { program: Program }) => (
  <div className="bg-white border-b border-gray-100">
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Info */}
        <div className="lg:col-span-2 mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">O tomto programe</h2>
          {program.description ? (
            <div className="prose prose-lg max-w-none text-blue-800 leading-relaxed">
              <p>{program.description}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Začnite svoju duchovnú cestu s {program.title}. Tento program obsahuje {program.total_sessions} starostlivo vybraných lekcií navrhnutých na prehĺbenie vašej viery a duchovnej praxe.
              </p>
              
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Čo vás čaká</h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• Štruktúrované lekcie pre duchovný rast</li>
                  <li>• Praktické cvičenia a meditácie</li>
                  <li>• Možnosť postupovať vlastným tempom</li>
                  <li>• Bohatý multimediálny obsah</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Program Details Sidebar */}
        <div>
          {/* Quick Stats */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detaily programu</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <Video size={16} />
                  Lekcie
                </span>
                <span className="font-semibold">{program.total_sessions}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <Video size={16} />
                  Celková dĺžka
                </span>
                <span className="font-semibold">
                  {Math.floor(program.total_duration_minutes / 60)}h {program.total_duration_minutes % 60}m
                </span>
              </div>
              
              {program.author && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Autor</span>
                  <span className="font-semibold">{program.author}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jazyk</span>
                <span className="font-semibold">{program.lang.toUpperCase()}</span>
              </div>
              
              {program.published_at && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Publikované</span>
                  <span className="font-semibold">
                    {formatDate(program.published_at, 'sk')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ProgramDetailPage() {
  const { supabase } = useSupabase();
  const { lang: appLang } = useLanguage();
  const params = useParams();
  const router = useRouter();
  
  const category = params.category as string;
  const programSlug = params.programSlug as string;
  
  const [program, setProgram] = useState<Program | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionMedia, setSessionMedia] = useState<Record<string, SessionMedia[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>([]);

  // Fetch program data
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const { data, error } = await supabase
          .from("programs")
          .select("*")
          .eq("slug", programSlug)
          .eq("category", category)
          .eq("is_published", true)
          .eq("lang", appLang)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Program sa nenašiel');
          } else {
            throw error;
          }
          return;
        }

        setProgram(data);
      } catch (error) {
        console.error('Error fetching program:', error);
        setError('Nepodarilo sa načítať program');
      }
    };

    fetchProgram();
  }, [supabase, programSlug, category, appLang]);

  // Fetch sessions when program is loaded
  useEffect(() => {
    if (!program) return;

    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from("program_sessions")
          .select("*")
          .eq("program_id", program.id)
          .eq("is_published", true)
          .order("session_order");

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, [supabase, program]);

  // Fetch media for sessions
  useEffect(() => {
    if (sessions.length === 0) {
      setLoading(false);
      return;
    }

    const fetchSessionMedia = async () => {
      try {
        const sessionIds = sessions.map(s => s.id);
        const { data, error } = await supabase
          .from("session_media")
          .select("*")
          .in("session_id", sessionIds)
          .eq("is_published", true)
          .order("media_order");

        if (error) throw error;

        // Group media by session_id
        const mediaBySession: Record<string, SessionMedia[]> = {};
        (data || []).forEach(media => {
          if (!mediaBySession[media.session_id]) {
            mediaBySession[media.session_id] = [];
          }
          mediaBySession[media.session_id].push(media);
        });

        setSessionMedia(mediaBySession);
      } catch (error) {
        console.error('Error fetching session media:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionMedia();
  }, [supabase, sessions]);

  // Load saved state from localStorage
  useEffect(() => {
    if (!program) return;

    // Load saved program status
    const savedPrograms = localStorage.getItem('savedPrograms');
    if (savedPrograms) {
      const parsed = JSON.parse(savedPrograms);
      setIsSaved(parsed.includes(program.id));
    }

    // Load bookmarked sessions
    const bookmarked = localStorage.getItem('bookmarkedSessions');
    if (bookmarked) {
      setBookmarkedSessions(JSON.parse(bookmarked));
    }
  }, [program]);

  // Handle program save
  const handleProgramSave = () => {
    if (!program) return;

    const savedPrograms = localStorage.getItem('savedPrograms');
    const current = savedPrograms ? JSON.parse(savedPrograms) : [];
    
    let updated;
    if (isSaved) {
      updated = current.filter((id: string) => id !== program.id);
    } else {
      updated = [...current, program.id];
    }
    
    localStorage.setItem('savedPrograms', JSON.stringify(updated));
    setIsSaved(!isSaved);
  };

  // Handle session bookmark
  const handleSessionBookmark = (sessionId: string) => {
    const updated = bookmarkedSessions.includes(sessionId)
      ? bookmarkedSessions.filter(id => id !== sessionId)
      : [...bookmarkedSessions, sessionId];
    
    localStorage.setItem('bookmarkedSessions', JSON.stringify(updated));
    setBookmarkedSessions(updated);
  };

  // Handle session start
  const handleSessionStart = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      router.push(`/programs/${program?.category}/${program?.slug}/${session.session_order}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Skeleton */}
        <HeroSkeleton />
        
        {/* Content Skeleton */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
          
          {/* Sessions Loading */}
          <SessionList
            program={{ id: '', category: '', slug: '' }}
            sessions={[]}
            sessionMedia={{}}
            loading={true}
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-6">😔</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {error || 'Program sa nenašiel'}
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Program, ktorý hľadáte, neexistuje alebo nie je dostupný. Možno bol odstránený alebo ste zadali nesprávnu adresu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Späť
            </button>
            <Link href="/programs">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Prehľadávať programy
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="container mx-auto px-6 pt-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Späť na programy
        </button>
      </div>

      {/* Hero Section */}
      {program && (
        <ProgramHero
          program={program}
          variant="default"
          showActions={true}
          showStats={true}
          showDescription={true}
          isSaved={isSaved}
          onSave={handleProgramSave}
          customCTA={
            sessions.length > 0 ? (
              <Link href={`/programs/${program.category}/${program.slug}/1`}>
                <button className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-3 shadow-lg">
                  <Video size={20} />
                  Začať cestu
                </button>
              </Link>
            ) : undefined
          }
        />
      )}

      {/* Program Info */}
      {program && <ProgramInfo program={program} />}

      {/* Sessions List */}
      {program && (
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Lekcie programu
              </h2>
              <p className="text-gray-600">
                Postupujte vlastným tempom cez jednotlivé lekcie programu
              </p>
            </div>

            <SessionList
              program={{
                id: program.id,
                category: program.category,
                slug: program.slug
              }}
              sessions={sessions}
              sessionMedia={sessionMedia}
              showMedia={true}
              showDescription={true}
              onSessionStart={handleSessionStart}
              onSessionBookmark={handleSessionBookmark}
              bookmarkedSessions={bookmarkedSessions}
              loading={loading}
            />
          </div>
        </div>
      )}
     
      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Pripravení začať svoju duchovnú cestu?</h3>
            <p className="text-xl text-blue-100 mb-8">
              Pripojte sa k tisíckam ľudí, ktorí už objavili silu duchovných cvičení
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {sessions.length > 0 && program && (
                <Link href={`/programs/${program.category}/${program.slug}/1`}>
                  <button className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-3">
                    <Video size={20} />
                    Začať teraz
                  </button>
                </Link>
              )}
              <Link href="/programs">
                <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-colors">
                  Preskúmať viac
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}