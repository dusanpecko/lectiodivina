import { sendEmailFromTemplate } from '@/lib/email-sender';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          product_snapshot
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, trackingNumber } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // First, get the current order details
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          product_snapshot
        )
      `)
      .eq('id', orderId)
      .single();

    if (fetchError || !currentOrder) {
      console.error('Error fetching order:', fetchError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: Record<string, string> = {};
    const oldStatus = currentOrder.status;
    
    if (status) {
      updateData.status = status;
    }
    
    if (trackingNumber !== undefined) {
      updateData.tracking_number = trackingNumber;
      // Automatically set status to 'shipped' when tracking number is added
      if (trackingNumber && !status) {
        updateData.status = 'shipped';
      }
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send email notification when status changes to 'shipped'
    const newStatus = updateData.status || oldStatus;
    if (newStatus === 'shipped' && oldStatus !== 'shipped' && currentOrder.shipping_address?.email) {
      try {
        const orderNumber = orderId.slice(0, 8).toUpperCase();
        const trackingNum = trackingNumber || currentOrder.tracking_number || 'Bude doplnené';
        
        await sendEmailFromTemplate({
          templateKey: 'order_shipped',
          recipientEmail: currentOrder.shipping_address.email,
          recipientName: currentOrder.shipping_address.name,
          userId: currentOrder.user_id || undefined,
          orderId: orderId,
          variables: {
            customer_name: currentOrder.shipping_address.name || 'Zákazník',
            order_number: orderNumber,
            tracking_number: trackingNum,
            carrier: 'Slovenská pošta',
            tracking_url: 'https://www.posta.sk/sledovanie-zasielok',
            estimated_delivery: '3-5 pracovných dní',
          },
        });

        console.log('✅ Order shipped email sent to:', currentOrder.shipping_address.email);
      } catch (emailError) {
        console.error('❌ Error sending order shipped email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
