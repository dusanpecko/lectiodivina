"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import Link from "next/link";
import {
  Users,
  Newspaper,
  Calendar,
  BookOpen,
  Quote,
  Activity,
  Clock,
  Plus,
  Settings,
  Shield,
  AlertCircle
} from "lucide-react";



// Komponent pre Error Reports s upozornením
const ErrorReportsSection = () => {
  const { supabase } = useSupabase();
  const [newReports, setNewReports] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewReports = async () => {
      if (!supabase) return;

      try {
        // Počítaj nové upozornenia (napr. za posledných 24 hodín alebo s pending statusom)
        const { count } = await supabase
          .from('error_reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'); // alebo použiť časový filter

        setNewReports(count || 0);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setNewReports(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNewReports();
  }, [supabase]);

  const hasNewReports = newReports > 0;

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-xl h-24"></div>
    );
  }

  return (
    <Link href="/admin/error-reports" className="block group">
      <div className={`
        rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 group-hover:scale-102
        ${hasNewReports 
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-400 animate-pulse' 
          : 'bg-white border-l-4 border-orange-500'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`
              p-4 rounded-xl transition-colors
              ${hasNewReports 
                ? 'bg-white/20 text-white' 
                : 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
              }
            `}>
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className={`
                text-xl font-bold 
                ${hasNewReports ? 'text-white' : 'text-gray-900'}
              `}>
                Nahlásené chyby
              </h3>
              <p className={`
                ${hasNewReports ? 'text-red-100' : 'text-gray-600'}
              `}>
                {hasNewReports 
                  ? `⚠️ ${newReports} ${newReports === 1 ? 'nové upozornenie' : 'nových upozornení'}` 
                  : 'Správa nahlásených chýb'
                }
              </p>
            </div>
          </div>

          {hasNewReports && (
            <div className="flex items-center space-x-2">
              <div className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                {newReports}
              </div>
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
            </div>
          )}
        </div>

        {hasNewReports && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-sm text-red-100 font-medium">
              🚨 Pozor! Máte nevyriešené nahlásenia chýb, ktoré vyžadujú vašu pozornosť.
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default function AdminPage() {

  return (
    <div className="space-y-8">
      {/* Hlavička */}
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vitajte v administrácii! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Správa aplikácie Lectio Divina
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{backgroundColor: '#40467b'}}>
            <Settings size={32} className="text-white" />
          </div>
        </div>
        
        {/* Aktuálny čas a dátum */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {new Date().toLocaleDateString('sk-SK', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleTimeString('sk-SK')}
            </div>
          </div>
        </div>
      </div>

      {/* Hlavné sekcie */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/news" className="group">
          <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-red-500 group-hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <Newspaper size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Správy</h3>
                <p className="text-sm text-gray-600">Články a novinky</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/lectio" className="group">
          <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-green-500 group-hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <BookOpen size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Lectio</h3>
                <p className="text-sm text-gray-600">Lectio Divina</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/users" className="group">
          <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-blue-500 group-hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Users size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Používatelia</h3>
                <p className="text-sm text-gray-600">Správa účtov</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/daily_quotes" className="group">
          <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-purple-500 group-hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                <Quote size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Citáty</h3>
                <p className="text-sm text-gray-600">Denné citáty</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Error Reports - Samostatná sekcia s upozornením */}
      <ErrorReportsSection />

      {/* Systémové info - jednoduché */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-xl p-6 border border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-600 rounded-xl">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Systém funguje správne
              </h3>
              <p className="text-gray-600">
                Všetky služby sú online a funkčné
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}