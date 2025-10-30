const http = require('http');

// First, fetch a valid topic UUID from the database
async function getTopicId() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data, error } = await supabase
    .from('notification_topics')
    .select('id, slug, name_sk')
    .eq('is_active', true)
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching topic:', error);
    throw error;
  }
  
  console.log('📋 Using topic:', data.name_sk, `(${data.slug})`);
  return data.id;
}

async function testAdminEndpoint() {
  try {
    // Get valid topic UUID
    const topicId = await getTopicId();
    
    const payload = JSON.stringify({
      title: 'Test Admin Notification',
      body: 'Toto je testovacia notifikacia z admin rozhrania',
      locale: 'sk',
      topic_id: topicId,
      image_url: 'https://lectiodivina.sk/images/test.jpg',
      screen: 'lectio',
      screen_params: JSON.stringify({ lectioId: '123' })
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/send-notification',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'abc587def456ghi321-admin-lectio-divina-2024'}`
      }
    };

    console.log('\n📤 Sending test notification via admin endpoint...');
    console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
    console.log('Topic ID:', topicId);
    
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n📥 Response Status:', res.statusCode);
        console.log('Response Body:', data);
        
        try {
          const response = JSON.parse(data);
          console.log('\n✅ Parsed Response:', JSON.stringify(response, null, 2));
          
          if (response.success) {
            console.log(`\n🎉 SUCCESS! Notification sent to ${response.sent_count || 0} devices`);
          } else {
            console.log('\n❌ FAILED:', response.message);
          }
        } catch (e) {
          console.log('❌ Failed to parse response as JSON');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
    });

    req.write(payload);
    req.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAdminEndpoint();
