#!/bin/bash

# Test Stripe webhook connectivity from server

echo "🔍 Testing Stripe webhook connectivity..."
echo ""

# Test 1: Can we reach Stripe API?
echo "1️⃣ Testing connection to Stripe API..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://api.stripe.com/v1

echo ""

# Test 2: Check if webhook endpoint is reachable from localhost
echo "2️⃣ Testing webhook endpoint from localhost..."
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{"type":"test"}' \
  -w "\nHTTP Status: %{http_code}\n" 2>&1 | tail -5

echo ""

# Test 3: Check from external
echo "3️⃣ Testing webhook endpoint from external (HTTPS)..."
curl -X POST https://lectio.one/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{"type":"test"}' \
  -w "\nHTTP Status: %{http_code}\n" 2>&1 | tail -5

echo ""
echo "✅ Tests complete. Check if all returned 400 (expected for invalid signature)"
