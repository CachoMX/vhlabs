// Check if the distribution performance view exists
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxieuybdhngkkkmaxpsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aWV1eWJkaG5na2trbWF4cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjU2NjMsImV4cCI6MjA4MTc0MTY2M30.Iz810S-OLictocvT_Hx3rZI7jhIkgPCTcJq9OEBVt5o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkView() {
  console.log('🔍 Checking v_distribution_performance view...\n');

  const { data, error } = await supabase
    .from('v_distribution_performance')
    .select('*');

  if (error) {
    console.error('❌ Error querying view:', error.message);
    console.log('\nThe view might not exist or have permission issues.');
  } else {
    console.log(`✅ View exists with ${data?.length || 0} records`);
    if (data && data.length > 0) {
      console.log('\nSample record:');
      console.log(JSON.stringify(data[0], null, 2));
    }
  }

  console.log('\n🔍 Checking distributions table directly...\n');

  const { data: distData, error: distError } = await supabase
    .from('distributions')
    .select('*')
    .limit(5);

  if (distError) {
    console.error('❌ Error querying distributions:', distError.message);
  } else {
    console.log(`✅ Found ${distData?.length || 0} distributions`);
    if (distData && distData.length > 0) {
      console.log('\nSample distribution:');
      console.log(JSON.stringify(distData[0], null, 2));
    }
  }
}

checkView().catch(console.error);
