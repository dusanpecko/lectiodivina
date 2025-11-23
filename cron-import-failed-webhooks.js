#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LOOKBACK_MINUTES = 5; // Check last 5 minutes

async function importFailedWebhooks() {
  try {
    const since = Math.floor(Date.now() / 1000) - (LOOKBACK_MINUTES * 60);
    
    // Get recent checkout.session.completed events
    const events = await stripe.events.list({
      type: 'checkout.session.completed',
      created: { gte: since },
      limit: 100
    });

    if (events.data.length === 0) {
      console.log(`[${new Date().toISOString()}] No recent checkout events`);
      return;
    }

    console.log(`[${new Date().toISOString()}] Found ${events.data.length} checkout events`);

    for (const event of events.data) {
      const session = event.data.object;
      
      // Check if already in database
      const { data: existingDonation } = await supabase
        .from('donations')
        .select('id')
        .eq('stripe_session_id', session.id)
        .single();

      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('stripe_customer_id', session.customer)
        .eq('stripe_subscription_id', session.subscription)
        .single();

      if (existingDonation || existingSubscription) {
        continue; // Already processed
      }

      // Determine if donation or subscription
      const isSubscription = session.mode === 'subscription' || session.subscription;

      if (isSubscription) {
        // Import as subscription
        const subscriptionData = await stripe.subscriptions.retrieve(session.subscription);
        
        // Find user by email
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.customer_email)
          .single();

        const tierMap = {
          0: 'prayer',
          300: 'friend',
          3000: 'friend',
          2000: 'patron',
          20000: 'patron',
          5000: 'founder',
          50000: 'founder'
        };

        const tier = tierMap[subscriptionData.items.data[0].price.unit_amount] || 'friend';

        const { error } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: user?.id || null,
            stripe_subscription_id: subscriptionData.id,
            stripe_customer_id: subscriptionData.customer,
            tier: tier,
            amount: subscriptionData.items.data[0].price.unit_amount / 100,
            status: subscriptionData.status,
            current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscriptionData.cancel_at_period_end,
            created_at: new Date(subscriptionData.created * 1000).toISOString()
          }]);

        if (error) {
          console.error(`❌ Failed to import subscription ${subscriptionData.id}:`, error.message);
        } else {
          console.log(`✅ Imported subscription ${subscriptionData.id} (${tier})`);
        }

      } else {
        // Import as donation
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.customer_email)
          .single();

        const paymentIntent = session.payment_intent 
          ? (typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent.id)
          : null;

        const { error } = await supabase
          .from('donations')
          .insert([{
            user_id: user?.id || null,
            amount: session.amount_total / 100,
            stripe_payment_id: paymentIntent,
            stripe_session_id: session.id,
            message: session.metadata?.message || null,
            is_anonymous: !user?.id,
            created_at: new Date(session.created * 1000).toISOString()
          }]);

        if (error) {
          console.error(`❌ Failed to import donation ${session.id}:`, error.message);
        } else {
          console.log(`✅ Imported donation ${session.id} (${session.amount_total / 100} EUR)`);
        }
      }
    }

  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
  }
}

importFailedWebhooks();
