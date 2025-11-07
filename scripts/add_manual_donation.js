/**
 * Script to manually add a donation to the database
 * Usage: node scripts/add_manual_donation.js
 * 
 * Make sure to update the values below before running!
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDonation() {
  // ⚠️ CHANGE THESE VALUES BEFORE RUNNING:
  const userId = 'YOUR_USER_ID_HERE'; // Get from: node scripts/get_user_id.js
  const amount = 5.00; // Amount in EUR
  const sessionId = 'cs_live_xxx'; // Stripe session ID from email/dashboard
  const message = 'Manual donation entry'; // Optional message
  
  // Validation
  if (userId === 'YOUR_USER_ID_HERE') {
    console.error('❌ Please set the userId before running!');
    console.error('Run: node scripts/get_user_id.js to find your user ID');
    process.exit(1);
  }
  
  if (!sessionId.startsWith('cs_')) {
    console.error('❌ Invalid Stripe session ID. Must start with "cs_"');
    process.exit(1);
  }
  
  console.log('📝 Adding donation...');
  console.log('   User ID:', userId);
  console.log('   Amount: €' + amount);
  console.log('   Session:', sessionId);
  
  const { data, error } = await supabase
    .from('donations')
    .insert({
      user_id: userId,
      amount: amount,
      stripe_session_id: sessionId,
      message: message,
      is_anonymous: false,
      created_at: new Date().toISOString()
    })
    .select();
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } else {
    console.log('✅ Donation added successfully!');
    console.log(JSON.stringify(data, null, 2));
  }
}

addDonation();
