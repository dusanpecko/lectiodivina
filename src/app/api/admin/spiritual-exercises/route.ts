import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// GET /api/admin/spiritual-exercises - List all exercises
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');

    let query = supabaseAdmin
      .from('spiritual_exercises')
      .select(`
        *,
        locale:locales(*)
      `)
      .order('start_date', { ascending: false });

    if (locale && locale !== 'all') {
      // Get locale_id from code
      const { data: localeData } = await supabaseAdmin
        .from('locales')
        .select('id')
        .eq('code', locale)
        .single();

      if (localeData) {
        query = query.eq('locale_id', localeData.id);
      }
    }

    const { data: exercises, error } = await query;

    if (error) throw error;

    return NextResponse.json({ exercises: exercises || [] });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

// POST /api/admin/spiritual-exercises - Create new exercise
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: exercise, error } = await supabaseAdmin
      .from('spiritual_exercises')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
