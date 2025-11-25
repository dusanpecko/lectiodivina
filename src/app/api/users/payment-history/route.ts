import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get auth token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user from session
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch user's matched bank payments
    const { data: payments, error } = await supabaseAdmin
      .from('bank_payments')
      .select('id, transaction_date, amount, currency, payment_type, payer_reference, counterparty_name, matched_at')
      .eq('user_id', user.id)
      .eq('matched', true)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching payment history:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch payment history',
        details: error.message,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    console.log(`Found ${payments?.length || 0} payments for user ${user.id}`);
    return NextResponse.json({ payments: payments || [] });
  } catch (error) {
    console.error('Error in payment history endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
