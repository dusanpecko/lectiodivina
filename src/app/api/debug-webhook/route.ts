import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log('🔍 DEBUG WEBHOOK - Start');
  
  try {
    // Get headers
    const headersList = await headers();
    const allHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
      allHeaders[key] = value;
    });
    
    // Get body in multiple ways
    const rawBody = await req.arrayBuffer();
    const bodyBuffer = Buffer.from(rawBody);
    const bodyString = bodyBuffer.toString('utf8');
    const bodyHex = bodyBuffer.toString('hex');
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: allHeaders,
      body: {
        length: bodyBuffer.length,
        asString: bodyString,
        asHex: bodyHex.substring(0, 200), // First 100 bytes in hex
        firstBytes: Array.from(bodyBuffer.slice(0, 20)),
      },
      encoding: {
        contentType: headersList.get('content-type'),
        charset: headersList.get('content-type')?.includes('charset') 
          ? headersList.get('content-type')?.split('charset=')[1] 
          : 'not specified',
      }
    };
    
    console.log('🔍 DEBUG INFO:', JSON.stringify(debugInfo, null, 2));
    
    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: 'Debug info logged to console',
    });
    
  } catch (error) {
    console.error('🔍 DEBUG ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Debug webhook endpoint. Use POST to test.',
    usage: 'curl -X POST https://lectio.one/api/debug-webhook -H "Content-Type: application/json" -d \'{"test":"data"}\'',
  });
}
