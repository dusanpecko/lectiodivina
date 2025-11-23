import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.arrayBuffer();
    const buffer = Buffer.from(body);
    
    console.log('✅ Test endpoint - Body size:', buffer.length);
    console.log('✅ Test endpoint - First 100 bytes:', buffer.toString('utf-8', 0, Math.min(100, buffer.length)));
    
    return NextResponse.json({ 
      success: true, 
      bodySize: buffer.length,
      firstBytes: buffer.toString('utf-8', 0, Math.min(100, buffer.length))
    });
  } catch (err) {
    console.error('❌ Test endpoint error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
