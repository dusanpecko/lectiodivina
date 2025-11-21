import { formatCurrency, formatDate, sendEmailFromTemplate } from '@/lib/email-sender';
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Disable body parser to get raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const timestamp = new Date().toISOString();
  console.log('🔔 Webhook V1 (Pages Router) received!', timestamp);

  let buf: Buffer;
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    buf = Buffer.concat(chunks);
  } catch (err) {
    console.error('❌ Error reading body:', err);
    return res.status(400).send(`Webhook Error: Body read failed`);
  }

  const sig = req.headers['stripe-signature'] as string;

  console.log('📝 Webhook secret configured:', webhookSecret ? 'YES' : 'NO');
  console.log('📝 Signature received:', sig ? 'YES' : 'NO');
  console.log('📝 Body length:', buf.length, 'bytes');

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
        console.error('Missing signature or webhook secret');
        return res.status(400).send('Missing signature or webhook secret');
    }
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log('✅ Webhook signature verified! Event type:', event.type);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Webhook signature verification failed: ${errorMessage}`);
    return res.status(400).send(`Webhook Error: ${errorMessage}`);
  }

  try {
    console.log(`📨 Webhook received: ${event.type}`);
    
    switch (event.type) {
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

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🆕 New customer subscription created:', subscription.id);
        break;
      }

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

      case 'payment_intent.created':
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`💳 Payment intent ${event.type}:`, paymentIntent.id);
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Webhook handler failed');
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub: any = subscription; // Cast to access period properties
  
  console.log('📊 Subscription data:', {
    id: subscription.id,
    status: subscription.status,
    current_period_start: sub.current_period_start,
    current_period_end: sub.current_period_end
  });

  // Create or update subscription in database
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

    // Send email notification
    try {
      // Get user email
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
  const sub: any = subscription; // Cast to access period properties
  
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

  const { data: donation, error } = await supabase.from('donations').insert({
    user_id: userId,
    amount: (session.amount_total || 0) / 100,
    stripe_payment_id: session.payment_intent as string,
    stripe_session_id: session.id,
    message: message || null,
    is_anonymous: !userId,
  }).select().single();

  if (error) {
    console.error('Error creating donation:', error);
  } else {
    console.log('✅ Donation created in database');

    // Send email notification
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

  // Send order confirmation email
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

      // Send renewal email
      try {
        // Get subscription from database
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

      // Send payment failed email
      try {
        // Get subscription from database
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
