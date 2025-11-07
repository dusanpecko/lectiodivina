/**
 * Script to get user ID from email
 * Usage: node scripts/get_user_id.js
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

async function getUserId() {
  // ⚠️ CHANGE THIS EMAIL:
  const searchEmail = 'dusan@example.com'; // Your email address
  
  console.log('🔍 Searching for user with email:', searchEmail);
  console.log('');
  
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  const user = data.users.find(u => u.email?.toLowerCase() === searchEmail.toLowerCase());
  
  if (user) {
    console.log('✅ User found!');
    console.log('   Email:', user.email);
    console.log('   User ID:', user.id);
    console.log('   Created:', user.created_at);
    console.log('');
    console.log('Copy this line to add_manual_donation.js:');
    console.log(`   const userId = '${user.id}';`);
  } else {
    console.log('❌ User not found with email:', searchEmail);
    console.log('');
    console.log('Available users:');
    data.users.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} → ${u.id}`);
    });
  }
}

getUserId();
