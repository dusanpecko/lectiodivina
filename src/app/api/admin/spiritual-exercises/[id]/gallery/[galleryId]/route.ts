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

// PATCH /api/admin/spiritual-exercises/[id]/gallery/[galleryId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; galleryId: string }> }
) {
  try {
    const { galleryId } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('spiritual_exercises_gallery')
      .update(body)
      .eq('id', galleryId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ galleryItem: data });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery item' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/spiritual-exercises/[id]/gallery/[galleryId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; galleryId: string }> }
) {
  try {
    const { galleryId } = await params;

    const { error } = await supabaseAdmin
      .from('spiritual_exercises_gallery')
      .delete()
      .eq('id', galleryId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}
