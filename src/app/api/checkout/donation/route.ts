import { createDonationCheckoutSession } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, userId, email, message } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Detect if request is from mobile
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /mobile|android|iphone|lectio/i.test(userAgent);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await createDonationCheckoutSession(
      amount,
      userId || null,
      isMobile 
        ? `lectio://donation/success?session_id={CHECKOUT_SESSION_ID}`
        : `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      isMobile
        ? `lectio://donation/cancel`
        : `${baseUrl}/support`,
      email,
      message
    );

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating donation checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
