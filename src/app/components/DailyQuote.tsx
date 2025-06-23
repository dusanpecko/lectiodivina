// components/DailyQuote.tsx
"use client";
"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { useSupabase } from "./SupabaseProvider";

type DailyQuoteRow = {
  date: string;
  quote: string;
  reference: string;
  lang: string;
};

export default function DailyQuote() {
  const { lang, isLoaded } = useLanguage();
  const { supabase } = useSupabase();
  const [quote, setQuote] = useState<DailyQuoteRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch quote only after mount and language is loaded
  useEffect(() => {
    if (!mounted || !isLoaded) return;

    async function fetchQuote() {
      setLoading(true);
      
      // SAFE: Date sa vytvorí len na client-side
      const today = new Date().toISOString().slice(0, 10);
      
      const { data, error } = await supabase
        .from("daily_quotes")
        .select("date,quote,reference,lang")
        .eq("date", today)
        .eq("lang", lang)
        .single();

      if (!error && data) {
        setQuote(data);
      } else {
        setQuote(null);
      }
      setLoading(false);
    }

    fetchQuote();
  }, [lang, supabase, mounted, isLoaded]);

  // Show consistent loading during SSR/hydration
  if (!mounted || !isLoaded || loading) {
    return (
      <div className="bg-[#4a5085]/10 text-[#4a5085] py-8 text-center text-xl font-medium">
        Načítavam citát...
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="bg-[#4a5085]/10 text-[#4a5085] py-8 text-center text-xl font-medium">
        Dnešný citát nebol nájdený.
      </div>
    );
  }

  return (
    <div className="bg-[#4a5085]/10 py-8 px-6 my-0 flex flex-col items-center">
      <blockquote className="text-2xl text-[#4a5085] font-semibold text-center mb-3">
        {quote.quote}
      </blockquote>
      <span className="text-[#4a5085] text-base">{quote.reference}</span>
    </div>
  );
}