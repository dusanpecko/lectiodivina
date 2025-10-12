import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({ 
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    hasAnonKey: !!supabaseAnonKey,
    url: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'Not set'
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      return NextResponse.json({ 
        error: 'Missing Supabase URL',
        details: { hasUrl: false }
      }, { status: 500 });
    }

    // Try service key first (bypasses RLS), fallback to anon key
    const supabaseKey = supabaseServiceKey || supabaseAnonKey;
    
    if (!supabaseKey) {
      return NextResponse.json({ 
        error: 'Missing Supabase keys',
        details: {
          hasServiceKey: !!supabaseServiceKey,
          hasAnonKey: !!supabaseAnonKey
        }
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const body = await request.json();
    
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('beta_feedback')
      .select('count', { count: 'exact' });

    if (testError) {
      return NextResponse.json({ 
        error: 'Database connection test failed',
        supabaseError: testError,
        details: {
          message: testError.message,
          code: testError.code,
          hint: testError.hint,
          details: testError.details
        },
        usingServiceKey: !!supabaseServiceKey
      }, { status: 500 });
    }

    // Try to insert data
    const { data, error } = await supabase
      .from('beta_feedback')
      .insert([{
        email: body.email,
        message: body.message,
        page_url: body.page_url,
        user_agent: body.user_agent,
        language: body.language
      }])
      .select();

    if (error) {
      return NextResponse.json({ 
        error: 'Insert failed',
        supabaseError: error,
        details: {
          message: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details
        },
        usingServiceKey: !!supabaseServiceKey,
        insertData: {
          email: body.email,
          message: body.message,
          page_url: body.page_url,
          user_agent: body.user_agent,
          language: body.language
        }
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      testCount: testData
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }, { status: 500 });
  }
}