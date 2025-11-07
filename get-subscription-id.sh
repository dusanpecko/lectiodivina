#!/bin/bash

# Quick script to get the latest test_daily subscription ID
# Usage: ./get-subscription-id.sh

echo "🔍 Fetching latest test_daily subscription from database..."
echo ""

# You'll need to run this in Supabase SQL Editor or psql
cat << 'SQL'
SELECT 
  stripe_subscription_id,
  tier,
  status,
  current_period_start::date as starts,
  current_period_end::date as renews,
  created_at::date as created
FROM subscriptions 
WHERE tier = 'test_daily'
ORDER BY created_at DESC
LIMIT 1;
SQL

echo ""
echo "💡 Copy the SQL above and run it in:"
echo "   → Supabase Dashboard → SQL Editor"
echo "   → Or psql/pgAdmin"
echo ""
echo "Then copy the 'stripe_subscription_id' value and use it:"
echo "   ./test-daily-renewal.sh <that_id>"
echo ""
echo "📝 Alternative: Check Stripe Dashboard"
echo "   → https://dashboard.stripe.com/test/subscriptions"
echo "   → Look for subscription with product 'Test Daily'"
echo ""
