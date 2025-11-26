import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Admin API - uses service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// GET - List all registrations for an exercise
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const exerciseId = params.id;

    const { data: registrations, error } = await supabaseAdmin
      .from('spiritual_exercises_registrations')
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('registration_date', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get counts by status
    const stats = {
      total: registrations.length,
      pending: registrations.filter((r) => r.payment_status === 'pending').length,
      deposit_paid: registrations.filter((r) => r.payment_status === 'deposit_paid').length,
      fully_paid: registrations.filter((r) => r.payment_status === 'fully_paid').length,
      cancelled: registrations.filter((r) => r.payment_status === 'cancelled').length,
    };

    return NextResponse.json({ registrations, stats });
  } catch (error) {
    console.error('Error in GET registrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
