#!/bin/bash

# Test AI Lectio Divina Generator API
# Použitie: ./test-ai-generator.sh

API_URL="http://localhost:3000/api/generate-lectio-divina"

# Test data
PERIKOPA_REF="Lk 17, 1-6"
PERIKOPA_TEXT="Potom povedal svojim učeníkom: \"Nie je možné, aby neprišli pohoršenia, ale beda tomu, skrze koho prichádzajú! Tomu by bolo lepšie, keby mu zavesili mlynský kameň na krk a hodili ho do mora, akoby mal pohoršiť jedného z týchto maličkých. Dávajte si pozor! Keď sa tvoj brat prehreší, pokarhaj ho! Ak sa obráti, odpusť mu! A keď sa aj sedem ráz za deň prehreší proti tebe a sedem ráz sa vráti k tebe a povie: \"Ľutujem,\" odpusť mu!\" Apoštoli povedali Pánovi: \"Daj nám väčšiu vieru!\" Pán vravel: \"Keby ste mali vieru ako horčičné zrnko a povedali by ste tejto moruši: \"Vytrhni sa aj s koreňom a presaď sa do mora,\" poslúchla by vás.\""

echo "🧪 Testing AI Lectio Divina Generator..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: GPT-4o
echo "📝 Test 1: Generating with GPT-4o..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"perikopa_ref\": \"$PERIKOPA_REF\",
    \"perikopa_text\": \"$PERIKOPA_TEXT\",
    \"model\": \"gpt-4o\"
  }" | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2: GPT-4o-mini
echo "📝 Test 2: Generating with GPT-4o-mini..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"perikopa_ref\": \"$PERIKOPA_REF\",
    \"perikopa_text\": \"$PERIKOPA_TEXT\",
    \"model\": \"gpt-4o-mini\"
  }" | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Tests completed!"
