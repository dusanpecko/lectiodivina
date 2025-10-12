import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    console.log('Fetching beta feedback with ID:', id);
    
    const { data, error } = await supabase
      .from('beta_feedback')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Beta feedback not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const { resolved, status, admin_notes } = await request.json();

    console.log('Updating beta feedback with ID:', id, { resolved, status, admin_notes });

    // Convert status to resolved for backward compatibility
    const resolvedValue = status ? 
      (status === 'resolved') : 
      resolved;

    const updateData: { 
      resolved: boolean; 
      admin_notes: string; 
      status?: 'new' | 'resolved' | 'sent_to_task' 
    } = { 
      resolved: resolvedValue, 
      admin_notes
    };

    // Add status field if provided
    if (status) {
      updateData.status = status;
    }

    const { error } = await supabase
      .from('beta_feedback')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}