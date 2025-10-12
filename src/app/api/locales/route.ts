// src/api/locales/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // Na čítanie zoznamu jazykov stačí anon key (nie service role)
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Locale {
  code: string;
  name: string;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('locales')
      .select('code, name')
      .order('name');

    if (error) {
      console.error('Error fetching locales:', error);
      return NextResponse.json({ error: 'Failed to fetch locales' }, { status: 500 });
    }

    // Vrátime data ako JSON odpoveď
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in locales API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
