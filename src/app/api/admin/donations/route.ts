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

    if (error) {
      console.error('Supabase error fetching donations:', error);
      throw error;
    }

    if (!donations || donations.length === 0) {
      console.log('No donations found in database');
      return NextResponse.json([]);
    }

    console.log(`Found ${donations.length} donations, fetching user data...`);

    // Fetch user info for each donation
    const donationsWithUsers = await Promise.all(
      donations.map(async (donation) => {
        // Handle anonymous donations
        if (!donation.user_id || donation.is_anonymous) {
          return {
            ...donation,
            user_email: '',
            user_name: 'Anonymný',
          };
        }

        try {
          // Get full_name and email from users table
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('full_name, email')
            .eq('id', donation.user_id)
            .single();
          
          return {
            ...donation,
            user_email: userData?.email || '',
            user_name: userData?.full_name || '',
          };
        } catch (userErr) {
          console.error(`Exception fetching user ${donation.user_id}:`, userErr);
          return {
            ...donation,
            user_email: '',
            user_name: '',
          };
        }
      })
    );

    console.log(`Successfully prepared ${donationsWithUsers.length} donations with user data`);
    return NextResponse.json(donationsWithUsers);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch donations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
