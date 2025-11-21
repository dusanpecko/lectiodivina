import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('Test endpoint hit');
  try {
    const text = await req.text();
    console.log('Body length:', text.length);
    return NextResponse.json({ received: true, length: text.length });
  } catch (e) {
    console.error('Error:', e);
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
