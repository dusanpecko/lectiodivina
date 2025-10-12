import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Test with service key (bypasses RLS)
    if (supabaseServiceKey) {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: serviceData, error: serviceError } = await supabaseService
        .from('error_reports')
        .select('count', { count: 'exact' });

      if (serviceError) {
        return NextResponse.json({
          success: false,
          method: 'service_key',
          error: {
            message: serviceError.message,
            code: serviceError.code,
            details: serviceError.details,
            hint: serviceError.hint
          }
        });
      }

      // Try to insert with service key
      const { data: insertData, error: insertError } = await supabaseService
        .from('error_reports')
        .insert([{
          email: 'test@example.com',
          message: 'Test message from service key',
          page_url: 'http://localhost:3000/test',
          user_agent: 'Test Browser',
          language: 'sk'
        }])
        .select();

      if (insertError) {
        return NextResponse.json({
          success: false,
          method: 'service_key',
          operation: 'insert',
          selectCount: serviceData,
          error: {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint
          }
        });
      }

      return NextResponse.json({
        success: true,
        method: 'service_key',
        selectCount: serviceData,
        insertedData: insertData
      });
    }

    // Test with anon key
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('error_reports')
      .select('count', { count: 'exact' });

    if (anonError) {
      return NextResponse.json({
        success: false,
        method: 'anon_key',
        error: {
          message: anonError.message,
          code: anonError.code,
          details: anonError.details,
          hint: anonError.hint
        }
      });
    }

    // Try to insert with anon key
    const { data: insertData, error: insertError } = await supabaseAnon
      .from('error_reports')
      .insert([{
        email: 'test@example.com',
        message: 'Test message from anon key',
        page_url: 'http://localhost:3000/test',
        user_agent: 'Test Browser',
        language: 'sk'
      }])
      .select();

    if (insertError) {
      return NextResponse.json({
        success: false,
        method: 'anon_key',
        operation: 'insert',
        selectCount: anonData,
        error: {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        }
      });
    }

    return NextResponse.json({
      success: true,
      method: 'anon_key',
      selectCount: anonData,
      insertedData: insertData
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}