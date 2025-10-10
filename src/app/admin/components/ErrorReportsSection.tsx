"use client";

import React, { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useLanguage } from '@/app/components/LanguageProvider';
import { adminTranslations } from '../translations';
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ErrorReportsSection() {
  const { supabase } = useSupabase();
  const { lang } = useLanguage();
  const t = adminTranslations[lang];
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
          .eq('status', 'pending');

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
                {t.reportedErrors}
              </h3>
              <p className={`
                ${hasNewReports ? 'text-red-100' : 'text-gray-600'}
              `}>
                {hasNewReports 
                  ? `⚠️ ${newReports} ${newReports === 1 ? t.newAlert : t.newAlerts}` 
                  : t.errorManagement
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
              {t.attentionNeeded}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
