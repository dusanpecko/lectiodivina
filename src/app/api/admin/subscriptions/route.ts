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
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(sub.user_id);
        
        return {
          ...sub,
          user_email: userData?.user?.email || '',
          user_name: userData?.user?.user_metadata?.name || '',
        };
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
