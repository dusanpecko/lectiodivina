import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Route segment config - disable Next.js body parsing
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log('🔔 Webhook received!');
  
  // Get raw body as Buffer for Stripe signature verification
  const buf = await req.arrayBuffer();
  const body = Buffer.from(buf).toString('utf8');
  
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  console.log('📝 Webhook secret configured:', webhookSecret ? 'YES' : 'NO');
  console.log('📝 Signature received:', signature ? 'YES' : 'NO');

  if (!signature) {
    console.error('❌ No signature in webhook request');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Webhook signature verified! Event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    console.log(`📨 Webhook received: ${event.type}`);
    
    switch (event.type) {
      // Handle successful subscription creation
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('🎉 Checkout session completed:', {
          sessionId: session.id,
          mode: session.mode,
          metadata: session.metadata
        });
        
        if (session.mode === 'subscription') {
          await handleSubscriptionCreated(session);
        } else if (session.metadata?.type === 'donation') {
          await handleDonationCompleted(session);
        } else if (session.metadata?.type === 'product_order') {
          console.log('📦 Processing product order...');
          await handleOrderCompleted(session);
        } else {
          console.log('⚠️ Unknown checkout type:', session.metadata);
        }
        break;
      }

      // Handle subscription updates
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      // Handle subscription deletion
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      // Handle successful invoice payment (subscription renewal)
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      // Handle payment failures
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const tier = session.metadata?.tier;
  const subscriptionId = session.subscription as string;

  if (!userId || !tier) {
    console.error('Missing user_id or tier in session metadata');
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subData = subscription as unknown as { current_period_start: number; current_period_end: number };

  // Create or update subscription in database
  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: subscription.customer as string,
    tier,
    amount: (subscription.items.data[0].price.unit_amount || 0) / 100,
    status: subscription.status,
    current_period_start: new Date((subData.current_period_start || subscription.created) * 1000).toISOString(),
    current_period_end: new Date((subData.current_period_end || (subscription.created + 2592000)) * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  if (error) {
    console.error('Error creating subscription:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  const subData = subscription as unknown as { current_period_start: number; current_period_end: number };
  
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subData.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error deleting subscription:', error);
  }
}

async function handleDonationCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id === 'anonymous' ? null : session.metadata?.user_id;
  const message = session.metadata?.message;

  const { error } = await supabase.from('donations').insert({
    user_id: userId,
    amount: (session.amount_total || 0) / 100,
    stripe_payment_id: session.payment_intent as string,
    stripe_session_id: session.id,
    message: message || null,
    is_anonymous: !userId,
  });

  if (error) {
    console.error('Error creating donation:', error);
  }
}

async function handleOrderCompleted(session: Stripe.Checkout.Session) {
  console.log('🛒 Starting order creation...');
  const userId = session.metadata?.user_id === 'guest' ? null : session.metadata?.user_id;
  const itemsJson = session.metadata?.items;

  if (!itemsJson) {
    console.error('❌ No items in order metadata');
    return;
  }

  const items = JSON.parse(itemsJson) as Array<{ id: string; qty: number }>;
  console.log('📋 Order items:', items);

  // Get product details
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .in('id', items.map((i) => i.id));

  if (productsError || !products) {
    console.error('❌ Could not fetch products:', productsError);
    return;
  }

  console.log('✅ Fetched products:', products.length);

  // Calculate total
  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product?.price || 0) * item.qty;
  }, 0);

  console.log('💰 Total calculated:', total);

  // Extract shipping and customer info from Stripe session
  const customerEmail = session.customer_email || session.customer_details?.email || null;
  
  // Get shipping address from session metadata (we stored it there)
  const metadataAddress = session.metadata?.shipping_address ? JSON.parse(session.metadata.shipping_address) : null;
  
  // Fallback to customer_details.address if no metadata
  const rawAddress = metadataAddress || session.customer_details?.address;
  
  const shippingAddress = rawAddress ? {
    name: session.customer_details?.name || metadataAddress?.name || '',
    street: metadataAddress?.street || rawAddress.line1 || '',
    city: rawAddress.city || '',
    postal_code: rawAddress.postal_code || '',
    country: rawAddress.country || '',
    phone: metadataAddress?.phone || session.customer_details?.phone || '',
    email: customerEmail || '',
  } : {};

  console.log('📧 Customer email:', customerEmail);
  console.log('📦 Shipping address:', shippingAddress);

  // Extract shipping cost and zone from metadata
  const shippingCost = parseFloat(session.metadata?.shipping_cost || '0');
  const shippingZone = session.metadata?.shipping_zone || '';

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total,
      status: 'paid',
      stripe_payment_id: session.payment_intent as string,
      stripe_session_id: session.id,
      shipping_address: shippingAddress,
      customer_email: customerEmail,
      shipping_cost: shippingCost,
      shipping_zone: shippingZone,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('❌ Error creating order:', orderError);
    return;
  }

  console.log('✅ Order created:', order.id);

  // Create order items
  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.id)!;
    return {
      order_id: order.id,
      product_id: item.id,
      product_snapshot: product,
      quantity: item.qty,
      price: product.price,
    };
  });

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

  if (itemsError) {
    console.error('❌ Error creating order items:', itemsError);
    return;
  }

  console.log('✅ Order items created:', orderItems.length);

  // Update product stock
  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    if (product) {
      const newStock = Math.max(0, product.stock - item.qty);
      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.id);
      console.log(`📦 Updated stock for "${product.name}": ${product.stock} → ${newStock}`);
    }
  }

  console.log('🎉 Order processing completed successfully!');
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const invoiceData = invoice as unknown as { subscription: string };
  const subscriptionId = invoiceData.subscription;

  console.log('💰 Invoice paid for subscription:', subscriptionId);

  if (subscriptionId) {
    // Get updated subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subData = subscription as unknown as { current_period_start: number; current_period_end: number };
    
    // Update subscription with new period dates
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subData.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('❌ Error updating subscription after payment:', error);
    } else {
      console.log('✅ Subscription updated with new billing period');
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const invoiceData = invoice as unknown as { subscription: string };
  const subscriptionId = invoiceData.subscription;

  if (subscriptionId) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Error updating subscription status:', error);
    }
  }
}
