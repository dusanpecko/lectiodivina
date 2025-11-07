const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://unnijykbupxguogrkolj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubmlqeWtidXB4Z3VvZ3Jrb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU0NzQ3NCwiZXhwIjoyMDY0MTIzNDc0fQ.SsElQaFFg6qFgiI5aIce56fB3B6Wg4okR4skl_52FrY'
);

async function addDonation() {
  // ZMEŇTE TIETO HODNOTY:
  const userId = 'YOUR_USER_ID_HERE'; // Váš user_id z Supabase auth.users
  const amount = 5.00; // Suma ktorú ste poslali
  const sessionId = 'cs_live_a1Q6LwO4fMq5ah3V5vxO6fj1gkysqKamvV4nDSMPOt4lV9Pieua2OPm2XW';
  const message = 'Test donation'; // Voliteľné
  
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
    console.error('Error:', error);
  } else {
    console.log('Donation added successfully:', data);
  }
}

addDonation();
