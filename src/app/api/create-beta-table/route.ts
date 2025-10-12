import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create beta_feedback table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS beta_feedback (
        id BIGSERIAL PRIMARY KEY,
        email TEXT,
        message TEXT NOT NULL,
        page_url TEXT,
        user_agent TEXT,
        language TEXT DEFAULT 'sk',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        resolved BOOLEAN DEFAULT FALSE,
        admin_notes TEXT
      );
    `;

    const { data: createResult, error: createError } = await supabase.rpc('exec', {
      sql: createTableSQL
    });

    if (createError) {
      return NextResponse.json({
        success: false,
        operation: 'create_table',
        error: createError
      });
    }

    // Create indexes
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_beta_feedback_created_at ON beta_feedback(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_beta_feedback_resolved ON beta_feedback(resolved);
    `;

    const { data: indexResult, error: indexError } = await supabase.rpc('exec', {
      sql: indexSQL
    });

    if (indexError) {
      return NextResponse.json({
        success: false,
        operation: 'create_indexes',
        error: indexError
      });
    }

    // Enable RLS and create policies
    const rlsSQL = `
      ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow anonymous beta feedback submissions" ON beta_feedback;
      DROP POLICY IF EXISTS "Admins can view all beta feedback" ON beta_feedback;
      DROP POLICY IF EXISTS "Admins can update beta feedback" ON beta_feedback;
      
      CREATE POLICY "Allow anonymous beta feedback submissions" ON beta_feedback
          FOR INSERT 
          WITH CHECK (true);
          
      CREATE POLICY "Admins can view all beta feedback" ON beta_feedback
          FOR SELECT 
          USING (
              EXISTS (
                  SELECT 1 FROM auth.users 
                  WHERE auth.users.id = auth.uid() 
                  AND auth.users.role = 'admin'
              )
          );
          
      CREATE POLICY "Admins can update beta feedback" ON beta_feedback
          FOR UPDATE 
          USING (
              EXISTS (
                  SELECT 1 FROM auth.users 
                  WHERE auth.users.id = auth.uid() 
                  AND auth.users.role = 'admin'
              )
          );
    `;

    const { data: rlsResult, error: rlsError } = await supabase.rpc('exec', {
      sql: rlsSQL
    });

    if (rlsError) {
      return NextResponse.json({
        success: false,
        operation: 'setup_rls',
        error: rlsError
      });
    }

    return NextResponse.json({
      success: true,
      message: 'beta_feedback table created successfully with RLS policies',
      operations: {
        create_table: createResult,
        create_indexes: indexResult,
        setup_rls: rlsResult
      }
    });

  } catch (error) {
    console.error('Table creation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}