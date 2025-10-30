#!/bin/bash

# Test FCM API s reálnym UUID z databázy
# Najprv získaj UUID topic z databázy

echo "🔍 Getting notification topics from database..."

# Môžeš zmeniť na správne UUID z tvojej databázy
# Spusti v Supabase: SELECT id, name_sk FROM notification_topics;

# Example UUID (nahraď skutočným UUID z databázy)
TOPIC_UUID="00000000-0000-0000-0000-000000000001"

echo ""
echo "📤 Sending test notification with topic UUID: $TOPIC_UUID"
echo ""

curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d "{
    \"topicId\":\"$TOPIC_UUID\",
    \"title\":\"🙏 Test Notifikácia\",
    \"body\":\"Test notifikácia z API endpointu\",
    \"localeCode\":\"sk\"
  }" | jq .

echo ""
echo "✅ Done!"
