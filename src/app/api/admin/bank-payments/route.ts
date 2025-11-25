import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch bank payments with pagination
    const { data: payments, error } = await supabaseAdmin
      .from('bank_payments')
      .select('*')
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error fetching bank payments:', error);
      throw error;
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch user info for matched payments
    const paymentsWithUsers = await Promise.all(
      payments.map(async (payment) => {
        if (!payment.matched || !payment.user_id) {
          return payment;
        }

        try {
          // Get full_name and email from users table
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('full_name, email')
            .eq('id', payment.user_id)
            .single();
          
          return {
            ...payment,
            user_email: userData?.email || '',
            user_name: userData?.full_name || '',
          };
        } catch (userErr) {
          console.error(`Exception fetching user ${payment.user_id}:`, userErr);
          return payment;
        }
      })
    );

    return NextResponse.json(paymentsWithUsers);
  } catch (error) {
    console.error('Error fetching bank payments:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch bank payments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
