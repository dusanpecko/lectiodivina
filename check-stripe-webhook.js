#!/usr/bin/env node
/**
 * Stripe Webhook Diagnostic Script
 * Checks if webhooks are properly configured and receiving events
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

async function checkWebhooks() {
  console.log('🔍 Checking Stripe Webhook Configuration...\n');

  try {
    // 1. Check if webhook secret is configured
    console.log('1️⃣ Webhook Secret Check:');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      console.log(`   ✅ Webhook secret configured: ${webhookSecret.substring(0, 15)}...`);
    } else {
      console.log('   ❌ Webhook secret NOT configured in .env.local');
    }
    console.log('');

    // 2. List all webhook endpoints
    console.log('2️⃣ Registered Webhook Endpoints:');
    const endpoints = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (endpoints.data.length === 0) {
      console.log('   ❌ No webhook endpoints found in Stripe');
    } else {
      endpoints.data.forEach((endpoint, index) => {
        console.log(`   Endpoint ${index + 1}:`);
        console.log(`      URL: ${endpoint.url}`);
        console.log(`      Status: ${endpoint.status}`);
        console.log(`      Events: ${endpoint.enabled_events.join(', ')}`);
        console.log(`      API Version: ${endpoint.api_version}`);
        console.log('');
      });
    }

    // 3. Get recent events
    console.log('3️⃣ Recent Stripe Events (last 10):');
    const events = await stripe.events.list({ limit: 10 });
    
    if (events.data.length === 0) {
      console.log('   No recent events');
    } else {
      events.data.forEach((event, index) => {
        const timestamp = new Date(event.created * 1000).toLocaleString();
        console.log(`   ${index + 1}. ${event.type} - ${timestamp}`);
        if (event.type === 'checkout.session.completed') {
          console.log(`      Session ID: ${event.data.object.id}`);
          console.log(`      Mode: ${event.data.object.mode}`);
          console.log(`      Metadata: ${JSON.stringify(event.data.object.metadata)}`);
        }
      });
    }
    console.log('');

    // 4. Check recent subscriptions
    console.log('4️⃣ Recent Subscriptions (last 5):');
    const subscriptions = await stripe.subscriptions.list({ limit: 5 });
    
    if (subscriptions.data.length === 0) {
      console.log('   No subscriptions found');
    } else {
      subscriptions.data.forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.id}`);
        console.log(`      Status: ${sub.status}`);
        console.log(`      Customer: ${sub.customer}`);
        console.log(`      Created: ${new Date(sub.created * 1000).toLocaleString()}`);
        console.log(`      Metadata: ${JSON.stringify(sub.metadata)}`);
        console.log('');
      });
    }

    // 5. Check webhook delivery attempts
    console.log('5️⃣ Recent Webhook Delivery Status:');
    const recentCheckoutEvents = events.data.filter(e => e.type === 'checkout.session.completed');
    
    if (recentCheckoutEvents.length > 0) {
      for (const event of recentCheckoutEvents) {
        console.log(`   Event: ${event.id} (${event.type})`);
        console.log(`   Created: ${new Date(event.created * 1000).toLocaleString()}`);
        console.log(`   Webhooks sent: ${event.webhooks_delivered_at ? 'YES' : 'NO'}`);
        if (event.webhooks_delivered_at) {
          console.log(`   Delivered at: ${new Date(event.webhooks_delivered_at * 1000).toLocaleString()}`);
        }
        console.log('');
      }
    } else {
      console.log('   No recent checkout.session.completed events found');
    }

    // 6. Recommendations
    console.log('\n📋 Recommendations:');
    console.log('');
    
    const productionUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const expectedWebhookUrl = `${productionUrl}/api/webhooks/stripe`;
    
    console.log(`✓ Your webhook URL should be: ${expectedWebhookUrl}`);
    console.log(`✓ Required events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.paid`);
    console.log(`✓ Webhook secret in Stripe Dashboard → Webhooks → [Your Endpoint] → Signing secret`);
    console.log('');
    
    const hasCorrectEndpoint = endpoints.data.some(e => e.url === expectedWebhookUrl);
    if (!hasCorrectEndpoint) {
      console.log('⚠️  WARNING: No webhook endpoint found matching your production URL!');
      console.log(`   Expected: ${expectedWebhookUrl}`);
      console.log(`   Found: ${endpoints.data.map(e => e.url).join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error checking webhooks:', error.message);
  }
}

checkWebhooks();
