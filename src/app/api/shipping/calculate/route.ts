import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Calculate shipping for a country and subtotal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country')?.toUpperCase();
    const subtotal = parseFloat(searchParams.get('subtotal') || '0');

    if (!country) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }

    // Fetch all active shipping zones
    const { data: zones, error } = await supabase
      .from('shipping_zones')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Find zone that includes this country
    let zone = zones?.find((z) => z.countries.includes(country));

    // If no zone found, use default zone (empty countries array)
    if (!zone) {
      zone = zones?.find((z) => z.countries.length === 0);
    }

    if (!zone) {
      return NextResponse.json(
        { error: 'No shipping zone found for this country' },
        { status: 404 }
      );
    }

    // Calculate shipping
    const isFree = subtotal >= zone.free_threshold;
    const cost = isFree ? 0 : zone.price;
    const amountUntilFree = isFree ? 0 : Math.max(0, zone.free_threshold - subtotal);

    return NextResponse.json({
      zone: {
        id: zone.id,
        name: zone.name,
        price: zone.price,
        free_threshold: zone.free_threshold,
        delivery_days: zone.delivery_days,
      },
      cost,
      isFree,
      amountUntilFree,
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
