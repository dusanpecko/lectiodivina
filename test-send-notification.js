/**
 * Test skript pre odoslanie push notifikácie cez FCM
 * 
 * Použitie:
 * node test-send-notification.js
 */

require('dotenv').config({ path: '.env.local' });

// Dynamický import pre ESM moduly
async function testNotification() {
  try {
    console.log('🚀 Starting FCM notification test...\n');

    // Test Firebase credentials
    console.log('📋 Checking Firebase credentials...');
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('❌ Missing Firebase credentials in .env.local');
      console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
      process.exit(1);
    }

    console.log('✅ Firebase credentials found');
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Client Email: ${clientEmail}`);
    console.log('');

    // Test Supabase connection
    console.log('📋 Checking Supabase credentials...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials in .env.local');
      console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    console.log('✅ Supabase credentials found');
    console.log(`   URL: ${supabaseUrl}`);
    console.log('');

    // Import Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active FCM tokens
    console.log('📱 Fetching active FCM tokens from database...');
    const { data: tokens, error: tokensError } = await supabase
      .from('user_fcm_tokens')
      .select('token, device_type, locale_code, user_id')
      .eq('is_active', true)
      .limit(5); // Test with max 5 tokens

    if (tokensError) {
      console.error('❌ Error fetching tokens:', tokensError);
      process.exit(1);
    }

    if (!tokens || tokens.length === 0) {
      console.log('⚠️  No active FCM tokens found in database');
      console.log('   Make sure mobile app is running and tokens are registered');
      console.log('   You can check with: SELECT * FROM user_fcm_tokens WHERE is_active = true;');
      process.exit(0);
    }

    console.log(`✅ Found ${tokens.length} active FCM token(s)`);
    tokens.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.device_type} (${t.locale_code}) - ${t.token.substring(0, 30)}...`);
    });
    console.log('');

    // Initialize Firebase Admin
    console.log('🔥 Initializing Firebase Admin SDK...');
    const { default: admin } = await import('firebase-admin');

    // Check if already initialized
    let app;
    try {
      app = admin.app();
      console.log('✅ Firebase Admin already initialized');
    } catch (e) {
      // Not initialized, create new instance
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin initialized successfully');
    }
    console.log('');

    // Send test notification
    console.log('📤 Sending test notification...');
    const messaging = app.messaging();

    const message = {
      tokens: tokens.map(t => t.token),
      notification: {
        title: '🙏 Test Notifikácia',
        body: 'Toto je testovacia notifikácia z Lectio Divina',
      },
      data: {
        type: 'test',
        timestamp: Date.now().toString(),
        source: 'test-script',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);

    console.log('✅ Notification sent!');
    console.log(`   Success: ${response.successCount}`);
    console.log(`   Failed: ${response.failureCount}`);
    console.log('');

    // Log failed tokens
    if (response.failureCount > 0) {
      console.log('❌ Failed tokens:');
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.log(`   ${idx + 1}. ${tokens[idx].token.substring(0, 30)}...`);
          console.log(`      Error: ${resp.error?.message}`);
        }
      });
      console.log('');
    }

    // Log to database
    console.log('📝 Logging to database...');
    try {
      await supabase.from('notification_logs').insert({
        topic_id: null,
        title: '🙏 Test Notifikácia',
        body: 'Toto je testovacia notifikácia z Lectio Divina',
        locale_code: 'sk',
        tokens_count: tokens.length,
        success_count: response.successCount,
        failure_count: response.failureCount,
        sent_at: new Date().toISOString(),
      });
      console.log('✅ Logged to notification_logs table');
    } catch (logError) {
      console.warn('⚠️  Failed to log to database:', logError.message);
    }

    console.log('');
    console.log('✅ Test completed successfully!');
    console.log('📱 Check your mobile device for the notification');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testNotification();
