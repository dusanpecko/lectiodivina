#!/usr/bin/env node
/**
 * Manual webhook test - simulates Stripe webhook for subscription created
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSubscriptionInsert() {
  console.log('🧪 Testing manual subscription insert to Supabase...\n');

  const testSubscription = {
    user_id: 'd0d8b50c-48a2-41c7-9d8d-a0b87422438c', // User ID from the payment
    stripe_subscription_id: 'sub_TEST_MANUAL_' + Date.now(),
    stripe_customer_id: 'cus_TEST_MANUAL',
    tier: 'friend',
    amount: 3.00,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_at_period_end: false,
  };

  console.log('Test data:', testSubscription);
  console.log('');

  const { data, error } = await supabase
    .from('subscriptions')
    .insert(testSubscription)
    .select();

  if (error) {
    console.error('❌ Error inserting subscription:', error);
  } else {
    console.log('✅ Subscription inserted successfully!');
    console.log('Data:', data);
  }

  // Check if it's now in the database
  console.log('\n🔍 Checking database...');
  const { data: allSubs, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', 'd0d8b50c-48a2-41c7-9d8d-a0b87422438c');

  if (fetchError) {
    console.error('❌ Error fetching subscriptions:', fetchError);
  } else {
    console.log(`Found ${allSubs.length} subscriptions for this user:`);
    allSubs.forEach(sub => {
      console.log(`  - ${sub.tier} (${sub.status}) - ${sub.stripe_subscription_id}`);
    });
  }
}

testSubscriptionInsert();
