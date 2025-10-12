#!/bin/bash

# Test script pre notification-logs API
# Spustite: bash test-notification-logs.sh

echo "🧪 Testing Notification Logs API..."
echo ""

# Nastavte váš admin token
ADMIN_TOKEN="${NEXT_PUBLIC_ADMIN_TOKEN:-your-admin-token}"
BASE_URL="http://localhost:3000"

echo "📡 Testing GET /api/admin/notification-logs"
echo "-------------------------------------------"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/api/admin/notification-logs?limit=10")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

echo ""
echo "-------------------------------------------"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ API funguje správne!"
  
  # Spočítaj počet záznamov
  COUNT=$(echo "$BODY" | jq '.logs | length' 2>/dev/null)
  TOTAL=$(echo "$BODY" | jq '.total' 2>/dev/null)
  
  if [ ! -z "$COUNT" ]; then
    echo "📊 Načítané záznamy: $COUNT"
    echo "📈 Celkový počet: $TOTAL"
  fi
else
  echo "❌ API vracá chybu!"
  echo "Skontrolujte:"
  echo "  1. Či beží dev server (npm run dev)"
  echo "  2. Či existuje tabuľka notification_logs v Supabase"
  echo "  3. Či je správny ADMIN_TOKEN"
fi
