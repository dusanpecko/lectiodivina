const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://unnijykbupxguogrkolj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubmlqeWtidXB4Z3VvZ3Jrb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU0NzQ3NCwiZXhwIjoyMDY0MTIzNDc0fQ.SsElQaFFg6qFgiI5aIce56fB3B6Wg4okR4skl_52FrY'
);

async function checkDonations() {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Total donations:', data.length);
    console.log('Donations:', JSON.stringify(data, null, 2));
  }
}

checkDonations();
