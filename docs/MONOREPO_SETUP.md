# 🎯 Monorepo Setup Dokument

## 📋 Prehľad

Lectio Divina projekt je teraz organizovaný ako **monorepo** s oddelenými backend a mobile projektmi.

## 📁 Štruktúra projektu

```
lectiodivina/                              # Root monorepo
│
├── backend/                               # ⚙️ Next.js Backend
│   ├── src/app/                          # Next.js aplikácia
│   │   ├── api/admin/                    # API endpoints
│   │   │   ├── send-notification/        # Push notifications s deep linking
│   │   │   └── topics/                   # Notification topics
│   │   ├── admin/                        # Admin panel
│   │   └── auth/                         # Authentication
│   ├── public/                           # Statické súbory
│   ├── docs/                             # Backend dokumentácia
│   ├── sql/                              # SQL skripty
│   ├── package.json                      # NPM dependencies
│   └── README.md
│
├── mobile/                                # 📱 Flutter Mobile App
│   ├── lib/                              # Flutter source code
│   │   ├── main.dart
│   │   ├── screens/                      # UI obrazovky
│   │   ├── services/                     # Backend služby
│   │   │   ├── fcm_service.dart         # Push notifications
│   │   │   └── notification_api.dart    # API komunikácia
│   │   ├── models/                       # Data modely
│   │   └── providers/                    # State management
│   ├── android/                          # Android konfigurácia
│   ├── ios/                              # iOS konfigurácia
│   ├── assets/                           # Obrázky, fonty
│   ├── pubspec.yaml                      # Dart dependencies
│   └── README.md
│
├── docs/                                  # 📚 Spoločná dokumentácia
│   └── DEEP_LINKING_FLUTTER_GUIDE.md    # Deep linking implementácia
│
├── .gitignore                            # Git ignore (backend + mobile)
├── lectiodivina.code-workspace           # VS Code multi-root workspace
└── README.md                             # Hlavný README
```

## 🚀 Quick Start

### 1. Otvor VS Code Workspace

```bash
cd /Users/dusanpecko/lectiodivina
code lectiodivina.code-workspace
```

VS Code otvorí **multi-root workspace** s 3 folders:
- ⚙️ Backend (Next.js)
- 📱 Mobile (Flutter)
- 📚 Docs

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend beží na: http://localhost:3000

### 3. Mobile Setup

```bash
cd mobile
flutter pub get
flutter run
```

## 🔧 VS Code Workspace Features

### Multi-root Folders
- Každý projekt (backend/mobile/docs) má vlastný panel
- Nezávislé navigácie a search
- Oddelené IntelliSense pre TypeScript a Dart

### Odporúčané Extensions
Automaticky navrhnuté pri otvorení workspace:
- ✅ ESLint (TypeScript linting)
- ✅ Prettier (Code formatting)
- ✅ Tailwind CSS IntelliSense
- ✅ Dart
- ✅ Flutter

### Settings
- **Backend:** Auto-format TypeScript/React súborov
- **Mobile:** Dart formatting s Flutter UI guides
- **Shared:** Exclude build folders, node_modules, .dart_tool

## 📦 Git Strategy

### Aktuálne: Monorepo (1 git repository)

```
.git/                    # Jeden shared git repo
├── backend/             # Backend commits
├── mobile/              # Mobile commits
└── docs/                # Docs commits
```

**Výhody:**
- Jeden commit pre frontend + backend zmeny
- Jednoduchšie atomic changes
- Spoločná dokumentácia

**Nevýhody:**
- Veľký repository
- Komplikovanejší CI/CD

### Budúce: Separate Repositories (odporúčané)

Môžeš neskôr rozdeliť na:

1. **github.com/dusanpecko/lectiodivina** (Backend)
2. **github.com/dusanpecko/lectiodivina-mobile** (Flutter)

A stále používať **VS Code workspace** pre lokálny development.

## 🔗 Deep Linking Integration

### Backend → Mobile Flow

1. **Admin panel** (`backend/src/app/admin/notifications/new/page.tsx`):
   - Admin vyberie screen: `article`
   - Admin zadá params: `{"articleId":"123"}`

2. **API endpoint** (`backend/src/app/api/admin/send-notification/route.ts`):
   - Odošle FCM notifikáciu s `data: { screen, screen_params }`

3. **Flutter app** (`mobile/lib/services/fcm_service.dart`):
   - Príjme notifikáciu
   - Parse screen + params
   - Navigate na konkrétnu obrazovku

📚 **Guide:** `docs/DEEP_LINKING_FLUTTER_GUIDE.md`

## 🛠️ Development Workflow

### Scenario 1: Práca na backend API

```bash
# Terminal 1: Backend dev server
cd backend
npm run dev

# VS Code: Edit backend/src/app/api/...
# Hot reload automaticky
```

### Scenario 2: Práca na Flutter UI

```bash
# Terminal 1: Flutter hot reload
cd mobile
flutter run

# VS Code: Edit mobile/lib/screens/...
# Hot reload: Press 'r' in terminal
```

### Scenario 3: End-to-end feature (Deep linking)

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Mobile
cd mobile && flutter run

# Test flow:
# 1. Admin panel → Create notification with screen="article"
# 2. Flutter app → Tap notification
# 3. App opens article screen
```

## 📝 Environment Variables

### Backend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

### Mobile (.env)
```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
API_BASE_URL=http://localhost:3000
FLUTTER_MOCK_NOTIFICATIONS=false
```

## 🚢 Deployment

### Backend (PM2)
```bash
cd backend
npm run build
pm2 start ecosystem.config.js
```

### Mobile (Stores)
```bash
# Android
cd mobile
flutter build appbundle --release

# iOS
flutter build ipa --release
```

## 📊 Project Stats

- **Backend:**
  - Framework: Next.js 15
  - Language: TypeScript
  - Lines: ~15,000
  - APIs: 10+ endpoints

- **Mobile:**
  - Framework: Flutter 3.x
  - Language: Dart
  - Lines: ~20,000
  - Screens: 15+ screens

- **Total:** Monorepo s ~35,000 lines of code

## 🎯 Next Steps

- [ ] Implementovať deep linking vo Flutter (guide ready)
- [ ] Nastaviť CI/CD pre backend (GitHub Actions)
- [ ] Nastaviť CI/CD pre mobile (Codemagic / Fastlane)
- [ ] Rozdeliť na separate git repositories (optional)
- [ ] Nastaviť staging environment

---

**Vytvorené:** 12. október 2025  
**Autor:** Dušan Pečko  
**Tech Stack:** Next.js + Flutter + Firebase + Supabase
