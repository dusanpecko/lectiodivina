# FCM Push Notifications - Quick Start Guide

## 🚀 Rýchle spustenie

### 1. Databázové tabuľky

Najprv vytvor databázové tabuľky v Supabase:

```bash
# Prihlás sa do Supabase Dashboard
# Prejdi do SQL Editor
# Skopíruj a spusti obsah súboru:
backend/sql/fcm_notifications_schema.sql
```

Alebo použij Supabase CLI:
```bash
cd backend
supabase db push
```

### 2. Environment variables

Uisti sa, že máš v `backend/.env.local`:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=lectio-divina-ef223
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@xxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: API Key protection
NOTIFICATIONS_API_KEY=your-secret-api-key
```

### 3. Spusti backend

```bash
cd backend
npm install
npm run dev
```

Backend bude dostupný na `http://localhost:3000`

### 4. Spusti mobilnú aplikáciu

```bash
cd mobile
flutter pub get
flutter run
```

### 5. Test notifikácií

**Metóda A: Node.js test skript**
```bash
cd backend
node test-send-notification.js
```

**Metóda B: Curl test**
```bash
cd backend
./test-fcm-api.sh
```

**Metóda C: Manuálny curl**
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": "1",
    "title": "Test Notifikácia",
    "body": "Testovacia správa",
    "localeCode": "sk"
  }'
```

## 📱 Kontrola FCM tokenov v databáze

```sql
-- Zobraz všetky aktívne FCM tokeny
SELECT 
  device_type,
  locale_code,
  LEFT(token, 30) as token_preview,
  last_used_at
FROM user_fcm_tokens 
WHERE is_active = true
ORDER BY last_used_at DESC;

-- Počet aktívnych tokenov podľa platformy
SELECT 
  device_type, 
  COUNT(*) as count
FROM user_fcm_tokens 
WHERE is_active = true
GROUP BY device_type;
```

## 🔍 Debugging

### Backend logs

```bash
cd backend
npm run dev

# Logs sa zobrazujú v konzole
```

### Mobile logs

V `mobile/lib/services/fcm_service.dart` sú už nastavené `Logger()` logy.

```bash
flutter run

# Logy sa zobrazujú v konzole
# Hľadaj: [FCM], [FcmService], ✅, ❌
```

### Supabase logs

```sql
-- Posledných 10 odoslaných notifikácií
SELECT 
  title,
  body,
  tokens_count,
  success_count,
  failure_count,
  sent_at
FROM notification_logs
ORDER BY sent_at DESC
LIMIT 10;
```

## 🐛 Časté problémy

### ❌ "No active FCM tokens found"

**Riešenie:**
1. Uisti sa, že mobilná aplikácia je spustená
2. Skontroluj permissions pre notifikácie na mobile
3. Skontroluj DB tabuľku `user_fcm_tokens`

```sql
SELECT COUNT(*) FROM user_fcm_tokens WHERE is_active = true;
```

### ❌ "Firebase Admin credentials not configured"

**Riešenie:**
1. Skontroluj `.env.local` v backend adresári
2. Uisti sa, že `FIREBASE_PRIVATE_KEY` obsahuje `\n` pre nové riadky
3. Reštartuj backend server

### ❌ "Failed to fetch tokens" (500 error)

**Riešenie:**
1. Skontroluj Supabase connection
2. Uisti sa, že tabuľky existujú
3. Skontroluj RLS policies v Supabase

```sql
-- Disable RLS temporarily for testing
ALTER TABLE user_fcm_tokens DISABLE ROW LEVEL SECURITY;
```

### ❌ Notifikácia sa neobjaví na mobile

**Riešenie:**
1. **iOS**: Skontroluj APNS certificate v Firebase Console
2. **Android**: Skontroluj `google-services.json` v `android/app/`
3. Skontroluj permissions na zariadení
4. Test na reálnom zariadení (nie emulátor)

## 📊 Monitoring

### Štatistiky odoslaných notifikácií

```sql
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as notifications_sent,
  SUM(tokens_count) as total_tokens,
  SUM(success_count) as total_success,
  SUM(failure_count) as total_failures,
  ROUND(AVG(success_count::numeric / NULLIF(tokens_count, 0) * 100), 2) as success_rate
FROM notification_logs
GROUP BY DATE(sent_at)
ORDER BY date DESC
LIMIT 7;
```

### Top notification topics

```sql
SELECT 
  nt.name_sk,
  COUNT(nl.id) as times_sent,
  SUM(nl.tokens_count) as total_recipients
FROM notification_topics nt
LEFT JOIN notification_logs nl ON nt.id = nl.topic_id
GROUP BY nt.id, nt.name_sk
ORDER BY times_sent DESC;
```

## 🚀 Production deployment

1. **Aktualizuj environment variables** na production serveri
2. **Spusti DB migrations** v Supabase production
3. **Test notifikácie** na staging prostredí
4. **Deploy backend** na Vercel/hosting
5. **Build & release mobile app** na App Store / Google Play

## 📚 Ďalšie dokumentácie

- [Podrobná dokumentácia](./docs/FCM_NOTIFICATIONS_GUIDE.md)
- [API dokumentácia](./docs/API_NOTIFICATIONS.md)
- [Firebase dokumentácia](https://firebase.google.com/docs/cloud-messaging)

## ⚡ Užitočné príkazy

```bash
# Backend
cd backend
npm run dev                    # Spusti dev server
node test-send-notification.js # Test notifikácie
./test-fcm-api.sh             # Test API curl

# Mobile
cd mobile
flutter pub get               # Nainštaluj dependencies
flutter run                   # Spusti app
flutter clean                 # Vyčisti build cache
flutter build apk            # Build Android APK
flutter build ios            # Build iOS

# Database
# V Supabase Dashboard > SQL Editor
SELECT * FROM user_fcm_tokens WHERE is_active = true;
SELECT * FROM notification_topics WHERE is_active = true;
SELECT * FROM notification_logs ORDER BY sent_at DESC LIMIT 10;
```
