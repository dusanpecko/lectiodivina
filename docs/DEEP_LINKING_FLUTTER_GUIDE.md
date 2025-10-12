# 🔗 Deep Linking - Flutter Implementation Guide

## 📋 Prehľad

Deep linking umožňuje otvoriť konkrétnu obrazovku v aplikácii po kliknutí na push notifikáciu.

**Backend už odosiela:** `screen` a `screen_params` v `data` payload notifikácie.

---

## 🎯 Ako to funguje

### 1. Backend odosiela notifikáciu:
```typescript
// API: /api/admin/send-notification
{
  notification: {
    title: "Nový článok",
    body: "Prečítajte si dnešný článok"
  },
  data: {
    locale: "sk",
    topic: "daily-readings",
    topic_id: "uuid-123",
    timestamp: "1234567890",
    image_url: "https://...",
    // ⭐ Deep linking fields:
    screen: "article",              // Cieľová obrazovka
    screen_params: '{"articleId":"123"}'  // JSON string s parametrami
  }
}
```

### 2. Flutter app dostane notifikáciu a spracuje ju.

---

## 🔧 Flutter Implementácia

### Krok 1: Aktualizuj FCM Service

V súbore `lib/services/fcm_service.dart`:

#### A) Pridaj handler pre notification tap:

```dart
// V _initializeLocalNotifications()
await flutterLocalNotificationsPlugin.initialize(
  initializationSettings,
  onDidReceiveNotificationResponse: (NotificationResponse response) async {
    // Spracuj tap na notifikáciu
    if (response.payload != null) {
      try {
        final Map<String, dynamic> data = jsonDecode(response.payload!);
        await _handleNotificationNavigation(data);
      } catch (e) {
        _logger.e('Error handling notification tap: $e');
      }
    }
  },
);
```

#### B) Pridaj navigation handler:

```dart
Future<void> _handleNotificationNavigation(Map<String, dynamic> data) async {
  final screen = data['screen'] as String?;
  final screenParamsJson = data['screen_params'] as String?;
  
  if (screen == null || screen.isEmpty) {
    _logger.i('No screen specified, ignoring navigation');
    return;
  }

  // Parse screen params
  Map<String, dynamic>? screenParams;
  if (screenParamsJson != null && screenParamsJson.isNotEmpty) {
    try {
      screenParams = jsonDecode(screenParamsJson) as Map<String, dynamic>;
    } catch (e) {
      _logger.w('Failed to parse screen_params: $e');
    }
  }

  _logger.i('Navigating to screen: $screen with params: $screenParams');

  // Call navigation callback
  if (_onNotificationCallback != null) {
    _onNotificationCallback!(RemoteMessage(
      data: {
        'screen': screen,
        'screen_params': screenParamsJson ?? '',
        ...data,
      },
    ));
  }
}
```

#### C) Setup foreground handler:

```dart
// V init() funkci
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  _logger.i('Foreground message received');
  
  // Show local notification
  _showLocalNotification(message);
});
```

#### D) Setup background handler:

```dart
// V init() funkci
FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
  _logger.i('Notification opened app from background');
  _handleNotificationNavigation(message.data);
});
```

#### E) Setup terminated handler:

```dart
// V init() funkci - check initial message
Future<void> init(String appLangCode) async {
  // ... existing code ...
  
  // Check if app was opened from terminated state
  final RemoteMessage? initialMessage = 
    await FirebaseMessaging.instance.getInitialMessage();
  
  if (initialMessage != null) {
    _logger.i('App opened from terminated state');
    // Wait for app to be ready, then navigate
    Future.delayed(Duration(seconds: 1), () {
      _handleNotificationNavigation(initialMessage.data);
    });
  }
}
```

---

### Krok 2: Vytvor Navigation Service

Vytvor nový súbor `lib/services/navigation_service.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:logger/logger.dart';

class NavigationService {
  static final NavigationService _instance = NavigationService._internal();
  factory NavigationService() => _instance;
  NavigationService._internal();

  final Logger _logger = Logger();
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  /// Navigate to screen based on notification data
  Future<void> navigateFromNotification(Map<String, dynamic> data) async {
    final screen = data['screen'] as String?;
    final screenParamsJson = data['screen_params'] as String?;

    if (screen == null || screen.isEmpty) {
      _logger.i('No screen specified');
      return;
    }

    // Parse params
    Map<String, dynamic>? params;
    if (screenParamsJson != null && screenParamsJson.isNotEmpty) {
      try {
        params = jsonDecode(screenParamsJson) as Map<String, dynamic>;
      } catch (e) {
        _logger.w('Failed to parse screen_params: $e');
      }
    }

    _logger.i('Navigating to: $screen with params: $params');

    // Get navigator context
    final context = navigatorKey.currentContext;
    if (context == null) {
      _logger.w('Navigator context is null');
      return;
    }

    // Navigate based on screen
    switch (screen) {
      case 'home':
        Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
        break;

      case 'lectio':
        Navigator.of(context).pushNamed('/lectio');
        break;

      case 'rosary':
        Navigator.of(context).pushNamed('/rosary');
        break;

      case 'article':
        final articleId = params?['articleId'] as String?;
        if (articleId != null) {
          Navigator.of(context).pushNamed(
            '/article',
            arguments: {'id': articleId},
          );
        } else {
          _logger.w('Missing articleId parameter');
          Navigator.of(context).pushNamed('/news');
        }
        break;

      case 'program':
        final programId = params?['programId'] as String?;
        if (programId != null) {
          Navigator.of(context).pushNamed(
            '/program',
            arguments: {'id': programId},
          );
        } else {
          _logger.w('Missing programId parameter');
          Navigator.of(context).pushNamed('/programs');
        }
        break;

      case 'calendar':
        Navigator.of(context).pushNamed('/calendar');
        break;

      case 'profile':
        Navigator.of(context).pushNamed('/profile');
        break;

      default:
        _logger.w('Unknown screen: $screen');
        // Fallback to home
        Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
    }
  }
}
```

---

### Krok 3: Aktualizuj Main App

V súbore `lib/main.dart`:

```dart
import 'package:flutter/material.dart';
import 'services/fcm_service.dart';
import 'services/navigation_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // ... Firebase initialization ...
  
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final NavigationService _navigationService = NavigationService();

  @override
  void initState() {
    super.initState();
    _initializeFCM();
  }

  Future<void> _initializeFCM() async {
    // Initialize FCM with navigation callback
    await FcmService.instance.init(
      'sk', // alebo dynamický jazyk
    );

    // Set notification callback
    FcmService.instance.setNotificationCallback((message) {
      _navigationService.navigateFromNotification(message.data);
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // ⭐ DÔLEŽITÉ: Pridaj navigatorKey
      navigatorKey: _navigationService.navigatorKey,
      title: 'Lectio Divina',
      initialRoute: '/',
      routes: {
        '/': (context) => HomeScreen(),
        '/lectio': (context) => LectioScreen(),
        '/rosary': (context) => RosaryScreen(),
        '/article': (context) => ArticleDetailScreen(),
        '/program': (context) => ProgramDetailScreen(),
        '/calendar': (context) => CalendarScreen(),
        '/profile': (context) => ProfileScreen(),
        '/news': (context) => NewsScreen(),
        '/programs': (context) => ProgramsScreen(),
      },
    );
  }
}
```

---

### Krok 4: Aktualizuj FCM Service - Callback

V `lib/services/fcm_service.dart` pridaj:

```dart
class FcmService {
  // ... existing code ...
  
  Function(RemoteMessage)? _onNotificationCallback;

  /// Set callback pre handling notifikácií
  void setNotificationCallback(Function(RemoteMessage) callback) {
    _onNotificationCallback = callback;
  }

  /// Existing _handleNotificationNavigation now calls the callback
  Future<void> _handleNotificationNavigation(Map<String, dynamic> data) async {
    final screen = data['screen'] as String?;
    
    if (screen == null || screen.isEmpty) {
      _logger.i('No screen specified, ignoring navigation');
      return;
    }

    _logger.i('Notification with screen: $screen');

    // Call navigation callback
    if (_onNotificationCallback != null) {
      _onNotificationCallback!(RemoteMessage(data: data));
    }
  }
}
```

---

## 📱 Príklady použitia

### Príklad 1: Otvoriť článok

**Admin panel:**
```
Screen: article
Params: {"articleId":"123"}
```

**Flutter dostane:**
```json
{
  "screen": "article",
  "screen_params": "{\"articleId\":\"123\"}"
}
```

**App naviguje na:**
```dart
Navigator.pushNamed('/article', arguments: {'id': '123'});
```

---

### Príklad 2: Otvoriť Lectio Divina

**Admin panel:**
```
Screen: lectio
Params: (prázdne)
```

**Flutter dostane:**
```json
{
  "screen": "lectio",
  "screen_params": ""
}
```

**App naviguje na:**
```dart
Navigator.pushNamed('/lectio');
```

---

### Príklad 3: Otvoriť program

**Admin panel:**
```
Screen: program
Params: {"programId":"456","tab":"schedule"}
```

**Flutter dostane:**
```json
{
  "screen": "program",
  "screen_params": "{\"programId\":\"456\",\"tab\":\"schedule\"}"
}
```

**App naviguje na:**
```dart
Navigator.pushNamed(
  '/program',
  arguments: {
    'id': '456',
    'tab': 'schedule'
  }
);
```

---

## 🧪 Testovanie

### Test 1: Foreground notification
1. App je otvorená
2. Admin odošle notifikáciu s `screen: "lectio"`
3. Notifikácia sa zobrazí ako lokálna
4. Tap na notifikáciu → App naviguje na Lectio screen

### Test 2: Background notification
1. App je v pozadí (home screen)
2. Admin odošle notifikáciu s `screen: "article"` a `params: {"articleId":"123"}`
3. Tap na notifikáciu → App sa otvorí a naviguje na článok 123

### Test 3: Terminated state
1. App je úplne zatvorená
2. Admin odošle notifikáciu s `screen: "rosary"`
3. Tap na notifikáciu → App sa spustí a naviguje na Rosary screen

### Test 4: Bez screen parametra
1. Admin odošle notifikáciu bez `screen` poľa
2. Tap na notifikáciu → App sa otvorí na home screen (default)

---

## 🐛 Troubleshooting

### Problém: Navigation nefunguje

**Riešenie 1:** Overiť navigatorKey
```dart
// V main.dart:
navigatorKey: _navigationService.navigatorKey,
```

**Riešenie 2:** Skontrolovať routes
```dart
// Všetky screeny musia byť v routes
routes: {
  '/': (context) => HomeScreen(),
  '/article': (context) => ArticleDetailScreen(),
  // ...
}
```

**Riešenie 3:** Debugovať data
```dart
Future<void> _handleNotificationNavigation(Map<String, dynamic> data) async {
  print('🔔 Notification data: $data');
  print('🔔 Screen: ${data['screen']}');
  print('🔔 Params: ${data['screen_params']}');
  // ...
}
```

### Problém: Params sa neparsujú

**Riešenie:**
```dart
try {
  final params = jsonDecode(screenParamsJson);
  print('Parsed params: $params');
} catch (e) {
  print('Parse error: $e');
  print('Raw string: $screenParamsJson');
}
```

### Problém: Notifikácia funguje len niekedy

**Príčina:** App state (foreground/background/terminated)

**Riešenie:** Implementuj všetky 3 handlery:
- `FirebaseMessaging.onMessage` - foreground
- `FirebaseMessaging.onMessageOpenedApp` - background
- `getInitialMessage()` - terminated

---

## 📊 Best Practices

### 1. **Validácia parametrov**
```dart
final articleId = params?['articleId'] as String?;
if (articleId == null || articleId.isEmpty) {
  _logger.w('Missing articleId');
  // Fallback navigation
  Navigator.pushNamed('/news');
  return;
}
```

### 2. **Error handling**
```dart
try {
  await _navigationService.navigateFromNotification(data);
} catch (e) {
  _logger.e('Navigation error: $e');
  // Fallback to home
  Navigator.pushNamedAndRemoveUntil('/', (route) => false);
}
```

### 3. **Logging**
```dart
_logger.i('📱 Navigating to: $screen');
_logger.i('📦 With params: $params');
_logger.i('🎯 Route: /article with id=$articleId');
```

### 4. **Delayed navigation** (pre terminated state)
```dart
if (initialMessage != null) {
  // Wait for app to initialize
  Future.delayed(Duration(milliseconds: 500), () {
    _handleNotificationNavigation(initialMessage.data);
  });
}
```

---

## 🎯 Rozšírené funkcie

### Analytics tracking:
```dart
Future<void> navigateFromNotification(Map<String, dynamic> data) async {
  final screen = data['screen'];
  
  // Track navigation
  await FirebaseAnalytics.instance.logEvent(
    name: 'notification_navigation',
    parameters: {
      'screen': screen,
      'has_params': data['screen_params'] != null,
    },
  );
  
  // Navigate...
}
```

### User confirmation:
```dart
Future<void> navigateFromNotification(Map<String, dynamic> data) async {
  final screen = data['screen'];
  
  // Show confirmation dialog
  final confirmed = await showDialog<bool>(
    context: navigatorKey.currentContext!,
    builder: (context) => AlertDialog(
      title: Text('Open $screen?'),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: Text('Cancel'),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, true),
          child: Text('Open'),
        ),
      ],
    ),
  );
  
  if (confirmed == true) {
    // Navigate...
  }
}
```

---

## 📚 Summary

### Čo backend odosiela:
```json
{
  "data": {
    "screen": "article",
    "screen_params": "{\"articleId\":\"123\"}"
  }
}
```

### Čo Flutter musí urobiť:
1. ✅ Parse `screen` a `screen_params` z notification data
2. ✅ Implementovať navigation handler
3. ✅ Registrovať navigatorKey
4. ✅ Nastaviť routes pre všetky screeny
5. ✅ Testovať všetky 3 app states

### Výsledok:
- 🔔 User dostane notifikáciu
- 👆 User tapne na notifikáciu
- 📱 App sa otvorí
- 🎯 Konkrétna obrazovka sa zobrazí
- ✨ Magic! 🎉

---

**Status:** ✅ Backend ready, Flutter implementation needed

**Next steps:** Implementuj FCM service updates vo Flutter app

**Dokumentácia aktualizovaná:** 12. október 2025
