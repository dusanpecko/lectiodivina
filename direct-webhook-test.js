const http = require('http');
const crypto = require('crypto');

const PORT = 3001;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_secret_here';

const server = http.createServer((req, res) => {
  console.log(`\n📥 Request received: ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    console.log('📦 Body length:', body.length);
    console.log('📝 Body preview:', body.substring(0, 200));
    
    const signature = req.headers['stripe-signature'];
    console.log('✍️ Signature:', signature);
    
    // Try to verify signature
    try {
      const timestamp = signature.split(',')[0].split('=')[1];
      const sig = signature.split(',')[1].split('=')[1];
      
      const payload = `${timestamp}.${body}`;
      const expectedSig = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload, 'utf8')
        .digest('hex');
      
      console.log('🔐 Signature valid:', sig === expectedSig);
      
      const event = JSON.parse(body);
      console.log('✅ Event type:', event.type);
      console.log('💾 Event data:', JSON.stringify(event.data.object, null, 2).substring(0, 500));
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'X-Direct-Webhook': 'v1'
      });
      res.end(JSON.stringify({ 
        received: true, 
        event: event.type,
        timestamp: new Date().toISOString()
      }));
      
    } catch (err) {
      console.error('❌ Error:', err.message);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Direct webhook server running on port ${PORT}`);
  console.log(`📍 URL: http://YOUR_SERVER_IP:${PORT}/webhook`);
  console.log(`🔑 Using webhook secret: ${WEBHOOK_SECRET.substring(0, 15)}...`);
  console.log('\nWaiting for webhooks...\n');
});
