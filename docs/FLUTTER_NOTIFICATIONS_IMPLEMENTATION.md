# Flutter Push Notifications Implementation Guide

## Úloha pre AI agenta:
Implementovať Firebase Cloud Messaging (FCM) push notifikácie vo Flutter aplikácii Lectio Divina s integráciou na existujúci backend API.

## Backend context (už implementované):
- API endpoint: `POST /api/user/fcm-tokens` - registrácia FCM tokenov
- API endpoint: `GET/POST /api/user/notification-preferences` - správa notification topics  
- Databáza: `user_fcm_tokens`, `user_notification_preferences`, `notification_topics`
- Admin panel: odosielanie notifikácií na konkrétnych odberateľov

## Flutter implementácia - kroky:

### 1. **Dependencies (pubspec.yaml)**
Pridať tieto dependencies:
```yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.2
  permission_handler: ^11.2.0
  shared_preferences: ^2.2.2
  http: ^1.1.2
  package_info_plus: ^5.0.1
  device_info_plus: ^9.1.1
```

### 2. **Firebase Configuration**
- Konfigurovať Firebase projekt pre Android/iOS
- Pridať `google-services.json` (Android) a `GoogleService-Info.plist` (iOS)
- Nastaviť FCM permissions v `android/app/src/main/AndroidManifest.xml`
- Nastaviť iOS capabilities pre notifications

### 3. **Hlavná FCM služba (fcm_service.dart)**
Vytvoriť kompletnú FCM service s týmito funkciami:
```dart
class FCMService {
  static FirebaseMessaging get messaging => FirebaseMessaging.instance;
  
  // 1. Inicializácia FCM
  Future<void> initialize();
  
  // 2. Získanie FCM tokenu
  Future<String?> getToken();
  
  // 3. Registrácia na backend
  Future<void> registerTokenOnServer(String token);
  
  // 4. Handling notifikácií
  void setupMessageHandlers();
  
  // 5. Local notifications setup
  Future<void> initializeLocalNotifications();
  
  // 6. Request permissions
  Future<bool> requestPermissions();
}
```

### 4. **API Integration**
Implementovať komunikáciu s backend API:
```dart
class NotificationAPI {
  static const String baseUrl = 'https://lectiodivina.sk/api';
  
  // Registrácia FCM tokenu
  Future<void> registerFCMToken({
    required String fcmToken,
    required String deviceType,
    required String appVersion,
    String? deviceId,
  });
  
  // Získanie notification topics  
  Future<List<NotificationTopic>> getTopics();
  
  // Aktualizácia topic preferencií
  Future<void> updateTopicPreference(String topicId, bool isEnabled);
  
  // Deaktivácia tokenu (pri odhlásení)
  Future<void> deactivateToken(String fcmToken);
}
```

### 5. **Notification Topics UI**
Vytvoriť obrazovku pre správu notification preferencií:
```dart
class NotificationSettingsPage extends StatefulWidget {
  // UI komponenty:
  // - List všetkých dostupných topics
  // - Toggle switch pre každú tému  
  // - Kategorizácia (duchovné, vzdelávacie, novinky...)
  // - Sync s backend API
  // - Loading/Error states
  // - Multilingual support (SK/EN/CS/ES)
}
```

### 6. **Background/Foreground Handling**
```dart
// Foreground messages
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  // Zobrazenie local notification
});

// Background messages  
FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

// App opened from notification
FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
  // Navigation based on notification data
});
```

### 7. **Local Notifications Configuration**
```dart
// Android notification channel
const AndroidNotificationChannel channel = AndroidNotificationChannel(
  'lectio_divina_notifications',
  'Lectio Divina Notifications',
  description: 'Notifications for Lectio Divina app',
  importance: Importance.high,
);
```

### 8. **Lifecycle Management** 
```dart
class App extends StatefulWidget {
  @override
  void initState() {
    super.initState();
    // 1. Inicializovať Firebase
    // 2. Request permissions
    // 3. Získať FCM token
    // 4. Registrovať na server
    // 5. Setup message handlers
  }
}
```

### 9. **Token Refresh Handling**
```dart
FirebaseMessaging.instance.onTokenRefresh.listen((String token) {
  // Update token on server when it changes
  NotificationAPI.registerFCMToken(fcmToken: token, ...);
});
```

### 10. **Error Handling & Retry Logic**
```dart
// Retry registrácia ak zlyhá
// Offline mode handling  
// Invalid token cleanup
// Permission denied scenarios
```

## Špecifické požiadavky:

### **A. Notification Topics Integration**
- Stiahnuť topics z `/api/user/notification-preferences`
- Zobraziť názvy podľa jazyka (name_sk, name_en, name_cs, name_es)
- Emoji ikony pre každú tému
- Kategorizácia topics  

### **B. Token Management**  
- Automatická registrácia pri prvom spustení
- Update pri zmene tokenu
- Deaktivácia pri odhlásení
- Cleanup starých/neplatných tokenov

### **C. UI/UX Requirements**
- Integrácia do existujúceho design systému
- Loading states pre API calls
- Error handling s user-friendly správami
- Offline mode support

### **D. Platform Specific**
- Android: Notification channels, icon, sound
- iOS: Badge management, sound, authorization
- Permission handling pre oba platformy

### **E. Analytics & Debugging**
- Logovanie FCM events
- Token registration success/failure
- Notification delivery tracking

## Validation & Testing:
1. Test registrácie FCM tokenu v databáze
2. Test notification delivery cez admin panel  
3. Test foreground/background/terminated states
4. Test topic subscription/unsubscription
5. Test permission scenarios
6. Test token refresh handling

## Expected deliverables:
1. Kompletne funkčné FCM implementácie
2. UI pre notification settings  
3. API integration s backend
4. Documentation & komentáre
5. Error handling & edge cases
6. Platform-specific configurations

## Backend API endpoints (reference):
```
POST /api/user/fcm-tokens - Register FCM token
GET /api/user/notification-preferences - Get topics & preferences  
POST /api/user/notification-preferences - Update topic preference
DELETE /api/user/fcm-tokens - Deactivate token
```

## Expected flow:
```
1. User installs app
2. App requests notification permissions
3. App gets FCM token from Firebase  
4. App registers token on backend via API
5. User can manage topics in settings
6. Admin sends notification to specific topic
7. Only subscribed users with active tokens receive it
```