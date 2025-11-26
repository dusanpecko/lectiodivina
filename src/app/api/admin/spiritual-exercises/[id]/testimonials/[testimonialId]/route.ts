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

// PATCH /api/admin/spiritual-exercises/[id]/testimonials/[testimonialId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; testimonialId: string }> }
) {
  try {
    const { testimonialId } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('spiritual_exercises_testimonials')
      .update(body)
      .eq('id', testimonialId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ testimonial: data });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/spiritual-exercises/[id]/testimonials/[testimonialId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; testimonialId: string }> }
) {
  try {
    const { testimonialId } = await params;

    const { error } = await supabaseAdmin
      .from('spiritual_exercises_testimonials')
      .delete()
      .eq('id', testimonialId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
