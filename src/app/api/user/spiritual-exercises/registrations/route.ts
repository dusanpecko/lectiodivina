import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET user's spiritual exercise registrations
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch registrations with exercise details
    const { data: registrations, error } = await supabase
      .from('spiritual_exercises_registrations')
      .select(`
        id,
        created_at,
        room_type,
        payment_status,
        status,
        first_name,
        last_name,
        spiritual_exercise:spiritual_exercise_id (
          id,
          title,
          slug,
          start_date,
          end_date,
          location_name,
          location_city,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
