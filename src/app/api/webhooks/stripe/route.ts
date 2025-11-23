import { formatCurrency, formatDate, sendEmailFromTemplate } from '@/lib/email-sender';
import { createClient } from '@supabase/supabase-js';
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
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Route segment config - disable Next.js body parsing
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log('🔔 Webhook V3 (App Router) received!', timestamp);
  
  let signature: string | null = null;
  let body: Buffer;
  
  try {
    signature = req.headers.get('stripe-signature');
    
    // Read body safely
    const arrayBuffer = await req.arrayBuffer();
    body = Buffer.from(arrayBuffer);
    
    console.log('📝 Body read success. Size:', body.length);
  } catch (err) {
    console.error('❌ Error reading request:', err);
    return new NextResponse(
      JSON.stringify({ error: 'Request read failed', details: String(err) }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json', 'X-Debug-Version': 'v3' }
      }
    );
  }

  if (!signature) {
    console.error('❌ No signature');
    return new NextResponse(
      JSON.stringify({ error: 'No signature' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json', 'X-Debug-Version': 'v3' }
      }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Signature verified:', event.type);
  } catch (err) {
    const error = err as Error;
    console.error('❌ Signature verification failed:', error.message);
    return new NextResponse(
      JSON.stringify({ error: 'Invalid signature', message: error.message }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json', 'X-Debug-Version': 'v3' }
      }
    );
  }

  // ... rest of the handler ...
  try {
    console.log(`📨 Processing event: ${event.type}`);
    
    switch (event.type) {
      // Handle successful subscription creation
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('🎉 Checkout session completed:', {
          sessionId: session.id,
          mode: session.mode,
          metadata: session.metadata,
          amount_total: session.amount_total,
          customer_email: session.customer_email,
        });
        
        try {
          if (session.mode === 'subscription') {
            console.log('📋 Processing subscription...');
            await handleSubscriptionCreated(session);
          } else if (session.metadata?.type === 'donation') {
            console.log('💰 Processing donation with metadata...');
            await handleDonationCompleted(session);
          } else if (session.metadata?.type === 'product_order') {
            console.log('📦 Processing product order...');
            await handleOrderCompleted(session);
          } else if (session.mode === 'payment' && !session.subscription) {
            // Fallback: If mode is payment and no subscription, treat as donation
            console.log('💰 Processing payment as donation (fallback)...');
            await handleDonationCompleted(session);
          } else {
            console.log('⚠️ Unknown checkout type. Mode:', session.mode, 'Metadata:', JSON.stringify(session.metadata));
          }
        } catch (handlerError) {
          console.error(`❌ Error in checkout handler:`, handlerError);
          // Don't throw, just log error so we return 200 to Stripe
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

      // Handle new customer creation
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🆕 New customer subscription created:', subscription.id);
        break;
      }

      // Handle invoice creation
      case 'invoice.created':
      case 'invoice.finalization_failed':
      case 'invoice.finalized':
      case 'invoice.payment_action_required':
      case 'invoice.upcoming':
      case 'invoice.updated': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`📄 Invoice event: ${event.type} for invoice:`, invoice.id);
        break;
      }

      // Handle PaymentIntent events
      case 'payment_intent.created':
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`💳 Payment intent ${event.type}:`, paymentIntent.id);
        break;
      }

      // Handle subscription schedule events
      case 'subscription_schedule.aborted':
      case 'subscription_schedule.canceled':
      case 'subscription_schedule.completed':
      case 'subscription_schedule.created':
      case 'subscription_schedule.expiring':
      case 'subscription_schedule.released':
      case 'subscription_schedule.updated': {
        const schedule = event.data.object as Stripe.SubscriptionSchedule;
        console.log(`📅 Subscription schedule ${event.type}:`, schedule.id);
        break;
      }

      // Handle customer entitlements
      case 'entitlements.active_entitlement_summary.updated': {
        console.log(`🎫 Customer entitlements updated`);
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Debug-Version': 'v3' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'X-Debug-Version': 'v3' }
      }
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

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub: any = subscription;
  
  console.log('📊 Subscription data:', {
    id: subscription.id,
    status: subscription.status,
    current_period_start: sub.current_period_start,
    current_period_end: sub.current_period_end
  });

  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: subscription.customer as string,
    tier,
    amount: (subscription.items.data[0].price.unit_amount || 0) / 100,
    status: subscription.status,
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  if (error) {
    console.error('Error creating subscription:', error);
  } else {
    console.log('✅ Subscription created in database');

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (profile?.email) {
        const tierNames: Record<string, string> = {
          supporter: 'Supporter',
          friend: 'Priateľ',
          patron: 'Patrón',
          benefactor: 'Benefactor',
          founder: 'Zakladateľ',
        };

        await sendEmailFromTemplate({
          templateKey: 'subscription_created',
          recipientEmail: profile.email,
          recipientName: profile.full_name || undefined,
          userId,
          subscriptionId: subscriptionId,
          variables: {
            customer_name: profile.full_name || 'Podporovateľ',
            tier_name: tierNames[tier] || tier,
            amount: formatCurrency((subscription.items.data[0].price.unit_amount || 0) / 100),
            interval: subscription.items.data[0].price.recurring?.interval === 'month' ? 'mesiac' : 'rok',
            start_date: formatDate(new Date(sub.current_period_start * 1000)),
            next_billing_date: formatDate(new Date(sub.current_period_end * 1000)),
            tier_benefits: 'Prístup k premium obsahu a podpora projektu',
            account_url: `${BASE_URL}/profile`,
          },
        });

        console.log('📧 Subscription email sent');
      }
    } catch (emailError) {
      console.error('❌ Error sending subscription email:', emailError);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub: any = subscription;
  
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
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
  
  console.log(`Processing donation for user ${userId}, amount ${(session.amount_total || 0) / 100}`);
  console.log('📝 Donation data:', {
    user_id: userId,
    amount: (session.amount_total || 0) / 100,
    stripe_payment_id: session.payment_intent,
    stripe_session_id: session.id,
    message: message || null,
    is_anonymous: !userId,
  });

  const { data: donation, error } = await supabase.from('donations').insert({
    user_id: userId,
    amount: (session.amount_total || 0) / 100,
    stripe_payment_id: session.payment_intent as string,
    stripe_session_id: session.id,
    message: message || null,
    is_anonymous: !userId,
  }).select().single();

  console.log('🔍 Insert result:', { donation, error });

  if (error) {
    console.error('❌ Error creating donation:', JSON.stringify(error, null, 2));
    return; // Stop if error
  } else {
    console.log('✅ Donation created in database with ID:', donation?.id);

    try {
      const recipientEmail = session.customer_email || session.customer_details?.email;
      
      if (recipientEmail) {
        const recipientName = session.customer_details?.name || 'Darujúci';

        await sendEmailFromTemplate({
          templateKey: 'donation_receipt',
          recipientEmail,
          recipientName,
          userId: userId || undefined,
          donationId: donation.id,
          variables: {
            donor_name: recipientName,
            amount: formatCurrency((session.amount_total || 0) / 100),
            message: message || '',
            has_message: !!message,
            donation_date: formatDate(new Date()),
            transaction_id: session.payment_intent as string,
            receipt_url: `${BASE_URL}/profile#donations`,
          },
        });

        console.log('📧 Donation email sent');
      }
    } catch (emailError) {
      console.error('❌ Error sending donation email:', emailError);
    }
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

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .in('id', items.map((i) => i.id));

  if (productsError || !products) {
    console.error('❌ Could not fetch products:', productsError);
    return;
  }

  console.log('✅ Fetched products:', products.length);

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product?.price || 0) * item.qty;
  }, 0);

  console.log('💰 Total calculated:', total);

  const customerEmail = session.customer_email || session.customer_details?.email || null;
  
  const metadataAddress = session.metadata?.shipping_address ? JSON.parse(session.metadata.shipping_address) : null;
  
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

  const shippingCost = parseFloat(session.metadata?.shipping_cost || '0');
  const shippingZone = session.metadata?.shipping_zone || '';

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

  try {
    if (customerEmail) {
      const itemsList = orderItems.map((item, index) => {
        const product = products[index];
        return `<li>${product?.name} - ${item.quantity}× - ${formatCurrency(item.price)}</li>`;
      }).join('');

      await sendEmailFromTemplate({
        templateKey: 'order_confirmation',
        recipientEmail: customerEmail,
        recipientName: shippingAddress.name || undefined,
        userId: userId || undefined,
        orderId: order.id,
        variables: {
          customer_name: shippingAddress.name || 'Zákazník',
          order_number: order.id.slice(0, 8).toUpperCase(),
          total_amount: formatCurrency(total),
          shipping_cost: formatCurrency(shippingCost),
          items: itemsList,
          shipping_name: shippingAddress.name || '',
          shipping_address: shippingAddress.street || '',
          shipping_city: shippingAddress.city || '',
          shipping_zip: shippingAddress.postal_code || '',
          shipping_country: shippingAddress.country || '',
        },
      });

      console.log('📧 Order confirmation email sent');
    }
  } catch (emailError) {
    console.error('❌ Error sending order confirmation email:', emailError);
  }

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
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
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
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('❌ Error updating subscription after payment:', error);
    } else {
      console.log('✅ Subscription updated with new billing period');

      try {
        const { data: dbSubscription } = await supabase
          .from('subscriptions')
          .select('*, profiles!inner(email, full_name)')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (dbSubscription && dbSubscription.profiles?.email) {
          await sendEmailFromTemplate({
            templateKey: 'subscription_renewal',
            recipientEmail: dbSubscription.profiles.email,
            recipientName: dbSubscription.profiles.full_name || undefined,
            userId: dbSubscription.user_id,
            subscriptionId: subscriptionId,
            variables: {
              customer_name: dbSubscription.profiles.full_name || 'Podporovateľ',
              tier_name: dbSubscription.tier,
              amount: formatCurrency(dbSubscription.amount),
              payment_date: formatDate(new Date()),
              next_billing_date: formatDate(new Date(subData.current_period_end * 1000)),
              receipt_url: invoice.hosted_invoice_url || `${BASE_URL}/profile`,
            },
          });

          console.log('📧 Subscription renewal email sent');
        }
      } catch (emailError) {
        console.error('❌ Error sending renewal email:', emailError);
      }
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
    } else {
      console.log('⚠️ Subscription marked as past_due');

      try {
        const { data: dbSubscription } = await supabase
          .from('subscriptions')
          .select('*, profiles!inner(email, full_name)')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (dbSubscription && dbSubscription.profiles?.email) {
          await sendEmailFromTemplate({
            templateKey: 'payment_failed',
            recipientEmail: dbSubscription.profiles.email,
            recipientName: dbSubscription.profiles.full_name || undefined,
            userId: dbSubscription.user_id,
            subscriptionId: subscriptionId,
            variables: {
              customer_name: dbSubscription.profiles.full_name || 'Podporovateľ',
              tier_name: dbSubscription.tier,
              error_reason: invoice.last_finalization_error?.message || 'Nepodarilo sa stiahnuť platbu z karty',
              update_payment_url: `${BASE_URL}/profile#subscription`,
              retry_attempts: '3',
            },
          });

          console.log('📧 Payment failed email sent');
        }
      } catch (emailError) {
        console.error('❌ Error sending payment failed email:', emailError);
      }
    }
  }
}
