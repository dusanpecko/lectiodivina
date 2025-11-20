/**
 * Test Email Sending
 * Script for testing email templates
 * 
 * Usage: node scripts/test-email.js <template_key> <recipient_email>
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mock data for testing
const mockData = {
  order_confirmation: {
    customer_name: 'Ján Novák',
    order_number: 'ORD12345',
    total_amount: '€29.99',
    shipping_cost: '€3.50',
    items: '<li>Kniha pokoja - 1× - €24.99</li><li>Notifikačný kríž - 1× - €2.00</li>',
    shipping_name: 'Ján Novák',
    shipping_address: 'Hlavná 123',
    shipping_city: 'Bratislava',
    shipping_zip: '811 01',
    shipping_country: 'Slovensko',
  },
  order_shipped: {
    customer_name: 'Ján Novák',
    order_number: 'ORD12345',
    tracking_number: 'SK123456789CZ',
    carrier: 'Slovenská pošta',
    tracking_url: 'https://www.posta.sk/trackandtrace',
    estimated_delivery: '3-5',
  },
  subscription_created: {
    customer_name: 'Mária Horváthová',
    tier_name: 'Supporter',
    amount: '€3.00',
    interval: 'mesiac',
    start_date: '7. novembra 2025',
    next_billing_date: '7. decembra 2025',
    tier_benefits: 'Prístup k premium obsahu a podpora projektu',
    account_url: 'https://lectiodivina.sk/profile',
  },
  subscription_renewal: {
    customer_name: 'Peter Kováč',
    tier_name: 'Patron',
    amount: '€20.00',
    payment_date: '7. novembra 2025',
    next_billing_date: '7. decembra 2025',
    receipt_url: 'https://lectiodivina.sk/profile',
  },
  subscription_cancelled: {
    customer_name: 'Eva Szabová',
    tier_name: 'Supporter',
    access_until: '31. decembra 2025',
    renew_url: 'https://lectiodivina.sk/support',
  },
  payment_failed: {
    customer_name: 'Tomáš Varga',
    tier_name: 'Patron',
    error_reason: 'Nedostatok prostriedkov na karte',
    update_payment_url: 'https://lectiodivina.sk/profile#subscription',
    retry_attempts: '3',
  },
  donation_receipt: {
    donor_name: 'Anna Lukáčová',
    amount: '€50.00',
    message: 'Nech sa Božie slovo šíri ďalej!',
    has_message: true,
    donation_date: '7. novembra 2025',
    transaction_id: 'pi_3Abc123XYZ',
    receipt_url: 'https://lectiodivina.sk/profile#donations',
  },
};

async function testEmail(templateKey, recipientEmail) {
  console.log(`\n🧪 Testing template: ${templateKey}`);
  console.log(`📧 Sending to: ${recipientEmail}\n`);

  if (!mockData[templateKey]) {
    console.error(`❌ Unknown template key: ${templateKey}`);
    console.log(`Available templates: ${Object.keys(mockData).join(', ')}`);
    process.exit(1);
  }

  try {
    // Import email sender dynamically
    const { sendEmailFromTemplate } = require('../src/lib/email-sender.ts');

    const result = await sendEmailFromTemplate({
      templateKey,
      recipientEmail,
      recipientName: mockData[templateKey].customer_name || mockData[templateKey].donor_name || 'Test User',
      variables: mockData[templateKey],
    });

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log(`📬 Message ID: ${result.messageId}`);
      
      // Check email logs
      const { data: logs } = await supabase
        .from('email_logs')
        .select('*')
        .eq('template_key', templateKey)
        .order('created_at', { ascending: false })
        .limit(1);

      if (logs && logs.length > 0) {
        console.log('\n📋 Email log:');
        console.log(`   Status: ${logs[0].status}`);
        console.log(`   Sent at: ${logs[0].sent_at}`);
        console.log(`   Subject: ${logs[0].subject}`);
      }
    } else {
      console.error('❌ Email sending failed:');
      console.error(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const templateKey = process.argv[2];
const recipientEmail = process.argv[3];

if (!templateKey || !recipientEmail) {
  console.log('Usage: node scripts/test-email.js <template_key> <recipient_email>');
  console.log('\nAvailable templates:');
  Object.keys(mockData).forEach(key => {
    console.log(`  - ${key}`);
  });
  process.exit(1);
}

testEmail(templateKey, recipientEmail);
