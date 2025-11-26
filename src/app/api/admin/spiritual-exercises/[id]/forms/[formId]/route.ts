import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// PATCH /api/admin/spiritual-exercises/[id]/forms/[formId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; formId: string }> }
) {
  try {
    const { formId } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('spiritual_exercises_forms')
      .update(body)
      .eq('id', formId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ form: data });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/spiritual-exercises/[id]/forms/[formId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; formId: string }> }
) {
  try {
    const { formId } = await params;

    const { error } = await supabaseAdmin
      .from('spiritual_exercises_forms')
      .delete()
      .eq('id', formId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}
