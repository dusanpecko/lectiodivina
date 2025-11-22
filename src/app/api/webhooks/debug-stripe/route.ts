import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  
  console.log('🔍 DEBUG WEBHOOK RECEIVED:', timestamp);
  
  // Get all headers
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });
  
  console.log('📋 Headers:', JSON.stringify(headers, null, 2));
  
  // Get body
  let bodyText = '';
  let bodyBuffer: Buffer | null = null;
  
  try {
    const arrayBuffer = await req.arrayBuffer();
    bodyBuffer = Buffer.from(arrayBuffer);
    bodyText = bodyBuffer.toString('utf8');
    
    console.log('📦 Body (UTF-8):', bodyText.substring(0, 500));
    console.log('📏 Body length:', bodyBuffer.length);
    console.log('🔢 Body encoding check:', {
      isUTF8: Buffer.isEncoding('utf8'),
      firstBytes: Array.from(bodyBuffer.slice(0, 20)),
    });
  } catch (err) {
    console.error('❌ Error reading body:', err);
  }
  
  // Try to detect encoding issues
  const signature = req.headers.get('stripe-signature');
  console.log('✍️ Stripe signature:', signature?.substring(0, 100));
  
  // Check for weird characters
  if (bodyText) {
    const hasNonASCII = /[^\x00-\x7F]/.test(bodyText);
    console.log('🌍 Has non-ASCII chars:', hasNonASCII);
  }
  
  return NextResponse.json({
    received: true,
    timestamp,
    bodyLength: bodyBuffer?.length || 0,
    signaturePresent: !!signature,
    headers: Object.keys(headers),
  }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Debug-Endpoint': 'debug-stripe',
    }
  });
}
