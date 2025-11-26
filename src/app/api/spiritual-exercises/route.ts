import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Public API - uses anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET - List all published spiritual exercises
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const localeCode = searchParams.get('locale'); // e.g., 'sk', 'en'

    let query = supabase
      .from('spiritual_exercises')
      .select(`
        id,
        title,
        slug,
        description,
        image_url,
        start_date,
        end_date,
        location_name,
        location_city,
        location_country,
        leader_name,
        max_capacity,
        locale:locales(id, code, native_name)
      `)
      .eq('is_published', true)
      .eq('is_active', true)
      .order('start_date', { ascending: true });

    // Filter by locale if provided
    if (localeCode) {
      // First get the locale id
      const { data: locale } = await supabase
        .from('locales')
        .select('id')
        .eq('code', localeCode)
        .single();

      if (locale) {
        query = query.eq('locale_id', locale.id);
      }
    }

    const { data: exercises, error } = await query;

    if (error) {
      console.error('Error fetching exercises:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ exercises: exercises || [] });
  } catch (error) {
    console.error('Error in GET spiritual exercises:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
