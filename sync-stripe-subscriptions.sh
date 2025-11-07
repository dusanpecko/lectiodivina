#!/bin/bash

# Sync Stripe subscriptions to Supabase database
# This script fetches active subscriptions from Stripe and inserts them into the database

echo "🔄 Syncing Stripe subscriptions to database..."
echo ""

# Get API key from .env.local
STRIPE_API_KEY=$(grep "^STRIPE_SECRET_KEY=" .env.local | cut -d '=' -f2)

if [ -z "$STRIPE_API_KEY" ]; then
  echo "❌ Error: STRIPE_SECRET_KEY not found in .env.local"
  exit 1
fi

# Get all active subscriptions for test_daily tier
echo "📋 Fetching test_daily subscriptions from Stripe..."
SUBSCRIPTIONS=$(stripe subscriptions list \
  --limit 100 \
  --status active \
  --api-key "$STRIPE_API_KEY" \
  -o json)

# Filter and format subscriptions
FORMATTED=$(echo "$SUBSCRIPTIONS" | jq -r '.data[] | select(.items.data[0].price.metadata.tier == "test_daily") | 
    {
      id: .id,
      customer: .customer,
      user_id: .metadata.user_id,
      tier: .metadata.tier,
      amount: (.items.data[0].price.unit_amount / 100),
      interval: .items.data[0].price.recurring.interval,
      status: .status,
      current_period_start: .items.data[0].current_period_start,
      current_period_end: .items.data[0].current_period_end,
      cancel_at_period_end: .cancel_at_period_end,
      created: .created
    }')

FORMATTED=$(echo "$SUBSCRIPTIONS" | jq -r '.data[] | select(.items.data[0].price.metadata.tier == "test_daily") | 
    {
      id: .id,
      customer: .customer,
      user_id: .metadata.user_id,
      tier: .metadata.tier,
      amount: (.items.data[0].price.unit_amount / 100),
      interval: .items.data[0].price.recurring.interval,
      status: .status,
      current_period_start: .current_period_start,
      current_period_end: .current_period_end,
      cancel_at_period_end: .cancel_at_period_end,
      created: .created
    }')

if [ -z "$FORMATTED" ]; then
  echo "❌ No test_daily subscriptions found"
  exit 0
fi

echo "✅ Found subscriptions:"
echo "$FORMATTED" | jq -r '.id'
echo ""

# Generate SQL
echo "📝 Generating SQL insert statements..."
cat > /tmp/sync_subscriptions.sql << 'SQLHEADER'
-- Auto-generated subscription sync
-- Generated at: 
SQLHEADER
date >> /tmp/sync_subscriptions.sql

echo "" >> /tmp/sync_subscriptions.sql

echo "$FORMATTED" | jq -r '
"INSERT INTO subscriptions (
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
  '\''\(.user_id)'\'',
  '\''\(.id)'\'',
  '\''\(.customer)'\'',
  '\''\(.tier)'\'',
  \(.amount),
  '\''\(.interval)'\'',
  '\''\(.status)'\'',
  to_timestamp(\(.current_period_start)),
  to_timestamp(\(.current_period_end)),
  \(.cancel_at_period_end),
  to_timestamp(\(.created)),
  NOW()
)
ON CONFLICT (stripe_subscription_id) 
DO UPDATE SET
  status = EXCLUDED.status,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  updated_at = NOW();
"
' >> /tmp/sync_subscriptions.sql

echo "" >> /tmp/sync_subscriptions.sql
echo "-- Verify" >> /tmp/sync_subscriptions.sql
echo "SELECT * FROM subscriptions WHERE tier = 'test_daily' ORDER BY created_at DESC;" >> /tmp/sync_subscriptions.sql

echo "✅ SQL generated: /tmp/sync_subscriptions.sql"
echo ""
echo "📋 Preview:"
cat /tmp/sync_subscriptions.sql
echo ""
echo "💡 To apply:"
echo "   1. Copy the SQL above"
echo "   2. Go to Supabase Dashboard → SQL Editor"
echo "   3. Paste and run"
echo ""
