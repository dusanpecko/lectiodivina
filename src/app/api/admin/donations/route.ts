import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all donations
    const { data: donations, error } = await supabaseAdmin
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch user info for each donation
    const donationsWithUsers = await Promise.all(
      (donations || []).map(async (donation) => {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(donation.user_id);
        
        return {
          ...donation,
          user_email: userData?.user?.email || '',
          user_name: userData?.user?.user_metadata?.name || '',
        };
      })
    );

    return NextResponse.json(donationsWithUsers);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
