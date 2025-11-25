import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Run automatic matching
export async function POST() {
  try {
    // Call the matching function
    const { data, error } = await supabaseAdmin.rpc('match_bank_payments_by_vs');

    if (error) {
      console.error('Error matching payments:', error);
      throw error;
    }

    const result = data?.[0] || { matched_count: 0, unmatched_count: 0, skipped_count: 0 };

    return NextResponse.json({
      success: true,
      matched: result.matched_count,
      unmatched: result.unmatched_count,
      skipped: result.skipped_count,
    });
  } catch (error) {
    console.error('Error in match endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to match payments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
