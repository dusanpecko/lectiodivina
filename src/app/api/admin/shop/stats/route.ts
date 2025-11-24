import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all data in parallel using Promise.all - 4x faster!
    const [
      { data: orders, error: ordersError },
      { data: products, error: productsError },
      { data: subscriptions, error: subscriptionsError },
      { data: donations, error: donationsError }
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('status, total, shipping_cost'),
      
      supabase
        .from('products')
        .select('is_active, stock'),
      
      supabase
        .from('subscriptions')
        .select('status, amount')
        .eq('status', 'active'),
      
      supabase
        .from('donations')
        .select('amount')
    ]);

    // Handle errors
    if (ordersError) {
      console.error('❌ Error fetching orders:', JSON.stringify(ordersError, null, 2));
    } else {
      console.log('✅ Orders fetched:', orders?.length || 0);
    }

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError);
    }

    if (donationsError) {
      console.error('Error fetching donations:', donationsError);
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

    const productStats = {
      total: products?.length || 0,
      active: products?.filter(p => p.is_active).length || 0,
      outOfStock: products?.filter(p => p.stock === 0).length || 0,
    };

    const subscriptionStats = {
      active: subscriptions?.length || 0,
      totalMRR: subscriptions?.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0) || 0,
    };

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
