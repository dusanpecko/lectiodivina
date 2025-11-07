#!/bin/bash
# Test script for simulating daily subscription renewal

echo "🧪 Daily Subscription Renewal Test"
echo "=================================="
echo ""

# Check if subscription ID is provided
if [ -z "$1" ]; then
  echo "❌ Usage: ./test-daily-renewal.sh <subscription_id>"
  echo ""
  echo "Example:"
  echo "  ./test-daily-renewal.sh sub_1SQaZhKF1O52aJAIYkK0ZK7o"
  echo ""
  echo "To get your subscription ID:"
  echo "  1. Subscribe to 'Test Denné' tier at http://localhost:3000/support"
  echo "  2. Check /account page after payment"
  echo "  3. Or check Stripe Dashboard → Subscriptions"
  exit 1
fi

SUB_ID=$1

echo "📋 Subscription ID: $SUB_ID"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
  echo "❌ Stripe CLI not installed!"
  echo "   Install: brew install stripe/stripe-cli/stripe"
  exit 1
fi

# Check if webhook listener is running
if ! ps aux | grep "stripe listen" | grep -v grep > /dev/null; then
  echo "⚠️  WARNING: Stripe webhook listener not running!"
  echo "   Start it: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
  echo ""
fi

echo "🔄 Simulating daily renewal..."
echo ""

# Get API key from .env.local
STRIPE_API_KEY=$(grep "^STRIPE_SECRET_KEY=" .env.local | cut -d '=' -f2)

if [ -z "$STRIPE_API_KEY" ]; then
  echo "❌ Error: STRIPE_SECRET_KEY not found in .env.local"
  exit 1
fi

# Validate subscription exists first
echo "🔍 Validating subscription..."
stripe subscriptions retrieve $SUB_ID --api-key "$STRIPE_API_KEY" > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Subscription not found: $SUB_ID"
  echo ""
  echo "Possible issues:"
  echo "  1. You used 'sub_YOUR_SUBSCRIPTION_ID' (placeholder) instead of real ID"
  echo "  2. Subscription doesn't exist yet - create one first!"
  echo "  3. Wrong Stripe account (check your API keys)"
  echo ""
  echo "📝 How to get real subscription ID:"
  echo ""
  echo "  STEP 1: Visit http://localhost:3000/support"
  echo "  STEP 2: Click 'Vybrať plán' on 'Test Denné' tier (yellow border, €1/deň)"
  echo "  STEP 3: Pay with test card: 4242 4242 4242 4242"
  echo "  STEP 4: After payment, go to http://localhost:3000/account"
  echo "  STEP 5: Copy the subscription ID (starts with 'sub_1...')"
  echo "  STEP 6: Run: ./test-daily-renewal.sh <real_sub_id>"
  echo ""
  echo "  OR check Stripe Dashboard: https://dashboard.stripe.com/test/subscriptions"
  echo ""
  exit 1
fi

echo "✅ Subscription found!"
echo ""

# Option 1: Fast-forward billing cycle (this actually triggers renewal)
echo "Method: Fast-forwarding billing cycle to trigger renewal..."
echo ""

stripe subscriptions update $SUB_ID \
  --billing-cycle-anchor now \
  --proration-behavior none \
  --api-key "$STRIPE_API_KEY" 2>&1

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Renewal triggered successfully!"
  echo ""
  echo "📊 What happened:"
  echo "   1. Billing cycle was fast-forwarded to now"
  echo "   2. Stripe charged the customer (€1 in test mode)"
  echo "   3. Stripe sent 'invoice.paid' webhook"
  echo "   4. Your server received it at /api/webhooks/stripe"
  echo "   5. handleInvoicePaid() function updated the database"
  echo "   6. current_period_end was set to tomorrow (now + 1 day)"
  echo ""
  echo "🔍 Check the results:"
  echo "   1. Server logs should show: '💰 Invoice paid for subscription: $SUB_ID'"
  echo "   2. Server logs should show: '✅ Subscription updated with new billing period'"
  echo "   3. Open http://localhost:3000/account"
  echo "   4. Look at 'Renews on' date - should be tomorrow!"
  echo ""
  echo "� In production:"
  echo "   - This happens AUTOMATICALLY every 24 hours"
  echo "   - No manual triggering needed"
  echo "   - Stripe handles everything"
  echo ""
  echo "🔁 To test another renewal (simulate tomorrow):"
  echo "   Wait 10 seconds, then run:"
  echo "   ./test-daily-renewal.sh $SUB_ID"
  echo ""
else
  echo ""
  echo "❌ Failed to trigger renewal. Check:"
  echo "   1. Is subscription ID correct? $SUB_ID"
  echo "   2. Is Stripe CLI authenticated? Run: stripe login"
  echo "   3. Are you using test mode keys in .env.local?"
  echo "   4. Is subscription already cancelled?"
  echo ""
  echo "Debug info:"
  stripe subscriptions retrieve $SUB_ID --api-key "$STRIPE_API_KEY"
fi
