/**
 * Test API endpoint /api/notifications/send s reálnym UUID z databázy
 */

require('dotenv').config({ path: '.env.local' });

async function testApiWithRealUUID() {
  try {
    console.log('🚀 Testing FCM API endpoint with real UUID...\n');

    // Import Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Získaj prvý notification topic z databázy
    console.log('📋 Fetching notification topics from database...');
    const { data: topics, error } = await supabase
      .from('notification_topics')
      .select('id, name_sk, name_en, category')
      .eq('is_active', true)
      .order('display_order')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching topics:', error);
      process.exit(1);
    }

    if (!topics || topics.length === 0) {
      console.error('❌ No notification topics found in database');
      console.log('ℹ️  Run the SQL schema first: backend/sql/fcm_notifications_schema.sql');
      process.exit(1);
    }

    const topic = topics[0];
    console.log(`✅ Using topic: "${topic.name_sk}" (${topic.category})`);
    console.log(`   UUID: ${topic.id}\n`);

    // Odošli test notifikáciu cez API
    console.log('📤 Sending notification via API endpoint...');
    
    const response = await fetch('http://localhost:3000/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topicId: topic.id,
        title: '🙏 Test Notifikácia z API',
        body: `Test notifikácia pre topic: ${topic.name_sk}`,
        localeCode: 'sk',
      }),
    });

    const result = await response.json();

    console.log('\n📥 API Response:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ Success!');
      console.log(`   Tokens: ${result.tokensCount || 0}`);
      console.log(`   Success: ${result.successCount || 0}`);
      console.log(`   Failed: ${result.failureCount || 0}`);
      console.log('\n📱 Check your mobile device for the notification!');
    } else {
      console.log('\n❌ API request failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${result.error || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test
testApiWithRealUUID();
