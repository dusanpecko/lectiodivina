import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

// Admin endpoint na manuálny import donácie zo Stripe Session ID
export async function POST(req: NextRequest) {
  try {
    const { sessionId, adminPassword } = await req.json();
    
    // Simple auth check
    if (adminPassword !== process.env.ADMIN_IMPORT_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }
    
    console.log('🔄 Importing donation from session:', sessionId);
    
    // Fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    console.log('✅ Session found:', {
      id: session.id,
      amount: session.amount_total,
      email: session.customer_email,
      metadata: session.metadata,
    });
    
    // Check if already imported
    const { data: existing } = await supabase
      .from('donations')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single();
    
    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Donation already exists',
        donationId: existing.id,
      });
    }
    
    // Import donation
    const userId = session.metadata?.user_id === 'anonymous' ? null : session.metadata?.user_id;
    const message = session.metadata?.message;
    
    const { data: donation, error } = await supabase.from('donations').insert({
      user_id: userId,
      amount: (session.amount_total || 0) / 100,
      stripe_payment_id: session.payment_intent as string,
      stripe_session_id: session.id,
      message: message || null,
      is_anonymous: !userId,
      created_at: new Date(session.created * 1000).toISOString(),
    }).select().single();
    
    if (error) {
      console.error('❌ Error creating donation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ Donation imported:', donation.id);
    
    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        amount: donation.amount,
        email: session.customer_email,
        user_id: userId,
        created_at: donation.created_at,
      },
    });
    
  } catch (error) {
    const err = error as Error;
    console.error('❌ Import error:', err);
    return NextResponse.json({
      error: err.message || 'Import failed',
    }, { status: 500 });
  }
}
