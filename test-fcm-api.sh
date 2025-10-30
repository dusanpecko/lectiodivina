#!/bin/bash

# Test skript pre FCM notifikácie API endpoint
# Použitie: ./test-fcm-api.sh

# Farby pre output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Testing FCM Notifications API${NC}\n"

# API endpoint
API_URL="http://localhost:3000/api/notifications/send"
# Pre production použite: https://lectiodivina.sk/api/notifications/send

echo -e "${YELLOW}📡 Endpoint:${NC} $API_URL\n"

# Test payload
PAYLOAD='{
  "topicId": "1",
  "title": "🙏 Test Notifikácia",
  "body": "Toto je testovacia notifikácia z Lectio Divina API",
  "data": {
    "type": "test",
    "timestamp": "'$(date +%s)'",
    "source": "curl-test"
  },
  "localeCode": "sk"
}'

echo -e "${YELLOW}📦 Payload:${NC}"
echo "$PAYLOAD" | jq .
echo ""

echo -e "${YELLOW}📤 Sending request...${NC}\n"

# Odošli request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Rozdeľ response na body a status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)

echo -e "${YELLOW}📥 Response (HTTP $HTTP_STATUS):${NC}"
echo "$HTTP_BODY" | jq .
echo ""

# Skontroluj status
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✅ Success! Notification sent.${NC}"
  
  # Parse success/failure counts
  SUCCESS_COUNT=$(echo "$HTTP_BODY" | jq -r '.successCount // 0')
  FAILURE_COUNT=$(echo "$HTTP_BODY" | jq -r '.failureCount // 0')
  TOKENS_COUNT=$(echo "$HTTP_BODY" | jq -r '.tokensCount // 0')
  
  echo -e "${GREEN}   Total tokens: $TOKENS_COUNT${NC}"
  echo -e "${GREEN}   Successful: $SUCCESS_COUNT${NC}"
  
  if [ "$FAILURE_COUNT" -gt 0 ]; then
    echo -e "${RED}   Failed: $FAILURE_COUNT${NC}"
  fi
  
  echo ""
  echo -e "${YELLOW}📱 Check your mobile device for the notification!${NC}"
else
  echo -e "${RED}❌ Failed with HTTP status: $HTTP_STATUS${NC}"
  
  ERROR_MSG=$(echo "$HTTP_BODY" | jq -r '.error // "Unknown error"')
  echo -e "${RED}   Error: $ERROR_MSG${NC}"
fi

echo ""
