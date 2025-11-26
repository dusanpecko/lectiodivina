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

// GET /api/admin/spiritual-exercises/[id]/pricing - List pricing for exercise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabaseAdmin
      .from('spiritual_exercises_pricing')
      .select('*')
      .eq('exercise_id', id)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ pricing: data });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}

// POST /api/admin/spiritual-exercises/[id]/pricing - Create new pricing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('spiritual_exercises_pricing')
      .insert({
        exercise_id: parseInt(id),
        ...body,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ pricing: data });
  } catch (error) {
    console.error('Error creating pricing:', error);
    return NextResponse.json(
      { error: 'Failed to create pricing' },
      { status: 500 }
    );
  }
}
