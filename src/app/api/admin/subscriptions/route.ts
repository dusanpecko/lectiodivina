import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all subscriptions
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch user info for each subscription
    const subscriptionsWithUsers = await Promise.all(
      (subscriptions || []).map(async (sub) => {
        try {
          // Get full_name and email from users table
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('full_name, email')
            .eq('id', sub.user_id)
            .single();
          
          return {
            ...sub,
            user_email: userData?.email || '',
            user_name: userData?.full_name || '',
          };
        } catch (userErr) {
          console.error(`Exception fetching user ${sub.user_id}:`, userErr);
          return {
            ...sub,
            user_email: '',
            user_name: '',
          };
        }
      })
    );

    return NextResponse.json(subscriptionsWithUsers);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
