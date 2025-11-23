#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Email helper functions
async function sendEmail({ to, subject, html, templateKey, userId, subscriptionId, donationId }) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.m1.websupport.sk',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"Lectio Divina" <info@lectio.one>',
      to,
      subject,
      html,
    });

    // Log email
    await supabase.from('email_logs').insert({
      template_key: templateKey,
      recipient_email: to,
      user_id: userId,
      subject,
      body: html,
      locale: 'sk',
      subscription_id: subscriptionId,
      donation_id: donationId,
      status: 'sent',
      provider: 'smtp',
      provider_message_id: info.messageId,
      sent_at: new Date().toISOString(),
    });

    console.log(`📧 Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Email failed:`, error.message);
    return false;
  }
}

async function sendDonationEmail(donation, userEmail) {
  const html = `
    <h2>Ďakujeme za vašu podporu! 🙏</h2>
    <p>Vaša finančná podpora bola úspešne prijatá.</p>
    <p><strong>Suma:</strong> €${donation.amount}</p>
    <p><strong>Dátum:</strong> ${new Date(donation.created_at).toLocaleDateString('sk-SK')}</p>
    <p>Vďaka vám môžeme pokračovať v našej misii prinášať Božie slovo do každodenného života.</p>
    <p>S vďakou,<br>Tím Lectio Divina</p>
  `;
  
  return sendEmail({
    to: userEmail,
    subject: '🙏 Ďakujeme za vašu podporu',
    html,
    templateKey: 'donation_receipt',
    userId: donation.user_id,
    donationId: donation.id,
  });
}

async function sendSubscriptionEmail(subscription, userEmail) {
  const tierNames = {
    prayer: '🙏 Modlitba',
    friend: '💙 Priateľ Lectio',
    patron: '💜 Patron Lectio',
    founder: '🌟 Zakladateľ Lectio'
  };

  const html = `
    <h2>Vitajte medzi podporovateľmi Lectio Divina! 🎉</h2>
    <p>Vaše predplatné bolo úspešne aktivované.</p>
    <p><strong>Úroveň:</strong> ${tierNames[subscription.tier] || subscription.tier}</p>
    <p><strong>Suma:</strong> €${subscription.amount}/mesiac</p>
    <p><strong>Platné do:</strong> ${new Date(subscription.current_period_end).toLocaleDateString('sk-SK')}</p>
    <p>Vaša podpora znamená pre nás veľmi veľa. Ďakujeme, že ste súčasťou našej komunity!</p>
    <p>S vďakou,<br>Tím Lectio Divina</p>
  `;
  
  return sendEmail({
    to: userEmail,
    subject: '🎉 Vitajte medzi podporovateľmi Lectio Divina',
    html,
    templateKey: 'subscription_created',
    userId: subscription.user_id,
    subscriptionId: subscription.id,
  });
}

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

        const { data: insertedSub, error } = await supabase
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
          }])
          .select();

        if (error) {
          console.error(`❌ Failed to import subscription ${subscriptionData.id}:`, error.message);
        } else {
          console.log(`✅ Imported subscription ${subscriptionData.id} (${tier})`);
          
          // Send email if user exists
          if (user?.id && session.customer_email) {
            await sendSubscriptionEmail(insertedSub[0], session.customer_email);
          }
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

        const { data: insertedDonation, error } = await supabase
          .from('donations')
          .insert([{
            user_id: user?.id || null,
            amount: session.amount_total / 100,
            stripe_payment_id: paymentIntent,
            stripe_session_id: session.id,
            message: session.metadata?.message || null,
            is_anonymous: !user?.id,
            created_at: new Date(session.created * 1000).toISOString()
          }])
          .select();

        if (error) {
          console.error(`❌ Failed to import donation ${session.id}:`, error.message);
        } else {
          console.log(`✅ Imported donation ${session.id} (${session.amount_total / 100} EUR)`);
          
          // Send email if customer provided email (skip stripe@lectio.one for anonymous donations)
          if (session.customer_email && session.customer_email !== 'stripe@lectio.one') {
            await sendDonationEmail(insertedDonation[0], session.customer_email);
          } else if (session.customer_email === 'stripe@lectio.one') {
            console.log(`ℹ️ Anonymous donation - skipping email`);
          }
        }
      }
    }

  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
  }
}

importFailedWebhooks();
