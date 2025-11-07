import { createProductCheckoutSession } from '@/lib/stripe';
import type { Product, ShippingAddress } from '@/types/ecommerce';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  price: number;
  free_threshold: number;
  delivery_days: string;
  is_active: boolean;
  sort_order: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress } = body as {
      items: Array<{ productId: string; quantity: number }>;
      shippingAddress: ShippingAddress;
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address required' },
        { status: 400 }
      );
    }

    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city) {
      return NextResponse.json(
        { error: 'Incomplete shipping address' },
        { status: 400 }
      );
    }

    // Fetch product details from database
    const productIds = items.map(item => item.productId);
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true);

    if (dbError || !products) {
      console.error('Error fetching products:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Map items with product details
    const enrichedItems = items.map(item => {
      const product = products.find((p: Product) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      // Check stock availability
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for: ${product.name.sk}`);
      }
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        name: product.name.sk, // Default to SK name for Stripe
      };
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}&type=order`;
    const cancelUrl = `${baseUrl}/cart`;

    // Get user ID from session if authenticated
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
        console.log('✅ Authenticated user checkout:', user.email);
      }
    }
    
    if (!userId) {
      console.log('🔓 Guest checkout');
    }

    // Calculate shipping cost from database
    const subtotal = enrichedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Fetch active shipping zones from database
    const { data: zones, error: zonesError } = await supabase
      .from('shipping_zones')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (zonesError || !zones || zones.length === 0) {
      console.error('Error fetching shipping zones:', zonesError);
      return NextResponse.json(
        { error: 'Failed to calculate shipping' },
        { status: 500 }
      );
    }

    // Find matching zone by country
    const upperCountry = shippingAddress.country.toUpperCase();
    let zone = zones.find((z: ShippingZone) => z.countries.includes(upperCountry));
    
    // Fallback to "Rest of World" zone (zone with no countries specified)
    if (!zone) {
      zone = zones.find((z: ShippingZone) => z.countries.length === 0);
    }

    if (!zone) {
      return NextResponse.json(
        { error: 'No shipping zone available for this country' },
        { status: 404 }
      );
    }

    // Calculate shipping cost
    const isFree = subtotal >= zone.free_threshold;
    const shippingCalc = {
      cost: isFree ? 0 : zone.price,
      zone: { name: zone.name, id: zone.id }
    };

    const session = await createProductCheckoutSession(
      enrichedItems,
      userId,
      successUrl,
      cancelUrl,
      shippingAddress.email,
      shippingAddress,
      shippingCalc.cost,
      shippingCalc.zone.name
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Product checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
