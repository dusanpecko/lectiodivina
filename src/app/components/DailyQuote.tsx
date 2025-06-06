// components/DailyQuote.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useLanguage } from "./LanguageProvider";

// nastav si svoje Supabase kľúče
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type DailyQuoteRow = {
  date: string;
  quote: string;
  reference: string;
  lang: string;
};

export default function DailyQuote() {
  const { lang } = useLanguage();
  const [quote, setQuote] = useState<DailyQuoteRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("daily_quotes")
        .select("date,quote,reference,lang")
        .eq("date", today)
        .eq("lang", lang)
        .single();

      if (!error && data) setQuote(data);
      else setQuote(null);
      setLoading(false);
    }
    fetchQuote();
  }, [lang]);

  if (loading)
    return (
      <div className="bg-[#4a5085]/10 text-[#4a5085] py-8 text-center text-xl font-medium">
        Načítavam citát...
      </div>
    );

  if (!quote)
    return (
      <div className="bg-[#4a5085]/10 text-[#4a5085] py-8 text-center text-xl font-medium">
        Dnešný citát nebol nájdený.
      </div>
    );

  return (
    <div className="/10 py-8 px-6 my-0 flex flex-col items-center">
      <blockquote className="text-2xl text-[#4a5085] font-semibold text-center mb-3">
        {quote.quote}
      </blockquote>
      <span className="text-[#4a5085] text-base">{quote.reference}</span>
    </div>
  );
}
