# Backend - Lectio Divina

Next.js backend server s admin panelom a API pre mobilnú aplikáciu.

## 🚀 Spustenie

```bash
npm install
npm run dev        # Development server
npm run build      # Production build
npm start          # Production server
```

Server beží na: http://localhost:3000

## 📁 Štruktúra

```
backend/
├── src/
│   └── app/
│       ├── api/              # API endpoints
│       │   └── admin/
│       │       ├── send-notification/  # Push notifications
│       │       └── topics/             # Notification topics
│       ├── admin/            # Admin panel
│       │   ├── notifications/
│       │   ├── articles/
│       │   ├── rosary/
│       │   └── calendar/
│       ├── auth/             # Authentication
│       └── components/       # React komponenty
│
├── public/                   # Statické súbory (obrázky, ikony)
├── docs/                     # Backend dokumentácia
├── sql/                      # SQL skripty pre databázu
└── utils/                    # Utility funkcie
```

## 🔑 Premenné prostredia

Vytvor `.env.local` súbor v root priečinku:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Firebase (FCM)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📚 API Dokumentácia

### Push Notifications
- **POST** `/api/admin/send-notification`
  - Odoslanie push notifikácie s deep linking podporou
  - Body: `{ title, body, topics, screen, screen_params }`

### Topics
- **GET** `/api/admin/topics`
  - Zoznam všetkých notification topics
- **POST** `/api/admin/topics`
  - Vytvorenie nového topic

## 🔗 Deep Linking

Backend podporuje deep linking pre notifikácie:

```json
{
  "screen": "article",
  "screen_params": "{\"articleId\":\"123\"}"
}
```

Viac info: `../docs/DEEP_LINKING_FLUTTER_GUIDE.md`

## 🚢 Deployment

### PM2 (Production)
```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
```

## 📝 Dokumentácia

Detailná dokumentácia v `docs/` priečinku:
- Notification system
- Admin panel
- Database schema
- Security best practices

---

**Tech Stack:** Next.js 15, TypeScript, Supabase, Firebase FCM
