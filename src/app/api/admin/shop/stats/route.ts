import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch orders stats
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('status, total, shipping_cost');

    if (ordersError) {
      console.error('❌ Error fetching orders:', JSON.stringify(ordersError, null, 2));
      // Even with error, continue with empty data
    } else {
      console.log('✅ Orders fetched:', orders?.length || 0);
    }

    // Calculate order stats
    // Stavy: pending (Čaká), paid (Zaplatené), processing (Spracováva sa), shipped (Odoslané), completed (Dokončené), cancelled (Zrušené)
    const orderStats = {
      total: orders?.length || 0,
      pending: orders?.filter(o => o.status === 'pending').length || 0,
      paid: orders?.filter(o => o.status === 'paid').length || 0,
      processing: orders?.filter(o => o.status === 'processing').length || 0,
      shipped: orders?.filter(o => o.status === 'shipped').length || 0,
      completed: orders?.filter(o => o.status === 'completed').length || 0,
      cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
      totalRevenue: orders?.reduce((sum, o) => sum + (parseFloat(o.total) || 0) + (parseFloat(o.shipping_cost) || 0), 0) || 0,
    };

    // Fetch products stats
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('is_active, stock');

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    const productStats = {
      total: products?.length || 0,
      active: products?.filter(p => p.is_active).length || 0,
      outOfStock: products?.filter(p => p.stock === 0).length || 0,
    };

    // Fetch subscriptions stats
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('status, amount')
      .eq('status', 'active');

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError);
    }

    const subscriptionStats = {
      active: subscriptions?.length || 0,
      totalMRR: subscriptions?.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0) || 0,
    };

    // Fetch donations stats
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('amount');

    if (donationsError) {
      console.error('Error fetching donations:', donationsError);
    }

    const donationStats = {
      total: donations?.length || 0,
      totalAmount: donations?.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) || 0,
    };

    return NextResponse.json({
      orders: orderStats,
      products: productStats,
      subscriptions: subscriptionStats,
      donations: donationStats,
    });
  } catch (error) {
    console.error('Shop stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
