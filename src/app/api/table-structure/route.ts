import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get table structure using information_schema
    const { data: columns, error } = await supabase
      .rpc('exec', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'error_reports' 
          ORDER BY ordinal_position;
        `
      });

    if (error) {
      // Try alternative approach - just select from the table to see what columns exist
      const { data: sampleData, error: selectError } = await supabase
        .from('error_reports')
        .select('*')
        .limit(1);

      if (selectError) {
        return NextResponse.json({
          error: 'Could not fetch table structure',
          selectError: {
            message: selectError.message,
            code: selectError.code,
            details: selectError.details,
            hint: selectError.hint
          },
          rpcError: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          }
        });
      }

      // Return sample data structure
      const columnNames = sampleData && sampleData.length > 0 
        ? Object.keys(sampleData[0]) 
        : [];

      return NextResponse.json({
        method: 'sample_data',
        columnNames,
        sampleData: sampleData?.[0] || null,
        totalRecords: sampleData?.length || 0
      });
    }

    return NextResponse.json({
      method: 'information_schema',
      columns
    });

  } catch (error) {
    console.error('Table structure error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}