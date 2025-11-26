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

// PATCH /api/admin/spiritual-exercises/[id]/pricing/[pricingId] - Update pricing
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pricingId: string }> }
) {
  try {
    const { pricingId } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('spiritual_exercises_pricing')
      .update(body)
      .eq('id', pricingId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ pricing: data });
  } catch (error) {
    console.error('Error updating pricing:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/spiritual-exercises/[id]/pricing/[pricingId] - Delete pricing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pricingId: string }> }
) {
  try {
    const { pricingId } = await params;

    const { error } = await supabaseAdmin
      .from('spiritual_exercises_pricing')
      .delete()
      .eq('id', pricingId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pricing:', error);
    return NextResponse.json(
      { error: 'Failed to delete pricing' },
      { status: 500 }
    );
  }
}
