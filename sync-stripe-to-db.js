#!/usr/bin/env node

/**
 * Sync Stripe subscriptions to Supabase database
 * Usage: node sync-stripe-to-db.js
 */

const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const STRIPE_SECRET_KEY = envContent.match(/STRIPE_SECRET_KEY=(.+)/)?.[1];

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  process.exit(1);
}

const stripe = require('stripe')(STRIPE_SECRET_KEY);

async function main() {
  console.log('🔄 Syncing Stripe subscriptions to database...\n');

  // Fetch all active subscriptions
  const subscriptions = await stripe.subscriptions.list({
    status: 'active',
    limit: 100,
  });

  // Filter test_daily subscriptions
  const testDailySubscriptions = subscriptions.data.filter(
    (sub) => sub.metadata.tier === 'test_daily'
  );

  if (testDailySubscriptions.length === 0) {
    console.log('❌ No test_daily subscriptions found');
    return;
  }

  console.log('✅ Found subscriptions:');
  testDailySubscriptions.forEach((sub) => console.log(`  - ${sub.id}`));
  console.log('');

  // Generate SQL
  const sqlStatements = testDailySubscriptions.map((sub) => {
    const item = sub.items.data[0];
    const amount = (item.price.unit_amount || 0) / 100;
    const interval = item.price.recurring?.interval || 'month';

    return `INSERT INTO subscriptions (
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  tier,
  amount,
  interval,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
) VALUES (
  '${sub.metadata.user_id}',
  '${sub.id}',
  '${sub.customer}',
  '${sub.metadata.tier}',
  ${amount},
  '${interval}',
  '${sub.status}',
  to_timestamp(${item.current_period_start}),
  to_timestamp(${item.current_period_end}),
  ${sub.cancel_at_period_end},
  to_timestamp(${sub.created}),
  NOW()
)
ON CONFLICT (stripe_subscription_id) 
DO UPDATE SET
  status = EXCLUDED.status,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  amount = EXCLUDED.amount,
  updated_at = NOW();`;
  });

  const sql = `-- Auto-generated subscription sync
-- Generated at: ${new Date().toISOString()}

${sqlStatements.join('\n\n')}

-- Verify
SELECT 
  id,
  stripe_subscription_id,
  tier,
  amount,
  interval,
  status,
  current_period_end,
  created_at
FROM subscriptions 
WHERE tier = 'test_daily'
ORDER BY created_at DESC;
`;

  // Write to file
  const outputPath = '/tmp/sync_subscriptions.sql';
  fs.writeFileSync(outputPath, sql);

  console.log(`✅ SQL generated: ${outputPath}\n`);
  console.log('📋 Preview:');
  console.log(sql);
  console.log('\n💡 To apply:');
  console.log('   1. Copy the SQL above');
  console.log('   2. Go to Supabase Dashboard → SQL Editor');
  console.log('   3. Paste and run\n');
  
  console.log('📊 Summary:');
  testDailySubscriptions.forEach((sub) => {
    const item = sub.items.data[0];
    const start = new Date(item.current_period_start * 1000);
    const end = new Date(item.current_period_end * 1000);
    console.log(`  ${sub.id}:`);
    console.log(`    Amount: €${(item.price.unit_amount / 100).toFixed(2)}/${item.price.recurring?.interval}`);
    console.log(`    Period: ${start.toLocaleString('sk-SK')} → ${end.toLocaleString('sk-SK')}`);
  });
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
