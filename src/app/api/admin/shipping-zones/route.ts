import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all shipping zones
export async function GET() {
  try {
    const { data: zones, error } = await supabase
      .from('shipping_zones')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(zones);
  } catch (error) {
    console.error('Error fetching shipping zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping zones' },
      { status: 500 }
    );
  }
}

// POST - Create new shipping zone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data: zone, error } = await supabase
      .from('shipping_zones')
      .insert({
        id: body.id,
        name: body.name,
        countries: body.countries,
        price: body.price,
        free_threshold: body.free_threshold,
        delivery_days: body.delivery_days,
        is_active: body.is_active ?? true,
        sort_order: body.sort_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Error creating shipping zone:', error);
    return NextResponse.json(
      { error: 'Failed to create shipping zone' },
      { status: 500 }
    );
  }
}

// PATCH - Update shipping zone
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    const { data: zone, error } = await supabase
      .from('shipping_zones')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Error updating shipping zone:', error);
    return NextResponse.json(
      { error: 'Failed to update shipping zone' },
      { status: 500 }
    );
  }
}

// DELETE - Delete shipping zone
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('shipping_zones')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipping zone:', error);
    return NextResponse.json(
      { error: 'Failed to delete shipping zone' },
      { status: 500 }
    );
  }
}
