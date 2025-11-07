/**
 * Script to check all donations in the database
 * Usage: node scripts/check_donations.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDonations() {
  console.log('📋 Fetching donations...\n');
  
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  console.log(`✅ Total donations: ${data.length}\n`);
  
  if (data.length > 0) {
    console.log('Recent donations:');
    data.forEach((d, i) => {
      console.log(`\n${i + 1}. ID: ${d.id}`);
      console.log(`   User: ${d.user_id}`);
      console.log(`   Amount: €${d.amount}`);
      console.log(`   Session: ${d.stripe_session_id}`);
      console.log(`   Message: ${d.message || '(none)'}`);
      console.log(`   Created: ${d.created_at}`);
    });
  } else {
    console.log('No donations found.');
  }
}

checkDonations();
