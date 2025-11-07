import { createSubscriptionCheckoutSession } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

const TIER_PRICE_IDS = {
  test_daily: process.env.STRIPE_PRICE_TEST_DAILY!,
  supporter: process.env.STRIPE_PRICE_SUPPORTER!,
  patron: process.env.STRIPE_PRICE_PATRON!,
  benefactor: process.env.STRIPE_PRICE_BENEFACTOR!,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, userId, email } = body;

    console.log('🔵 Subscription checkout request:', { tier, userId, email });

    if (!tier || tier === 'free' || !TIER_PRICE_IDS[tier as keyof typeof TIER_PRICE_IDS]) {
      console.error('❌ Invalid tier:', tier);
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const priceId = TIER_PRICE_IDS[tier as keyof typeof TIER_PRICE_IDS];
    console.log('💰 Using Price ID:', priceId);

    if (!priceId) {
      console.error('❌ Price ID not found for tier:', tier);
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await createSubscriptionCheckoutSession(
      userId,
      priceId,
      tier,
      `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/support`,
      email
    );

    console.log('✅ Checkout session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creating subscription checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
