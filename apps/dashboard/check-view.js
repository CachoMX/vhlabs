// Check if the view exists and has data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxieuybdhngkkkmaxpsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aWV1eWJkaG5na2trbWF4cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjU2NjMsImV4cCI6MjA4MTc0MTY2M30.Iz810S-OLictocvT_Hx3rZI7jhIkgPCTcJq9OEBVt5o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkView() {
  console.log('🔍 Checking v_contact_overview view...\n');

  const { data, error } = await supabase
    .from('v_contact_overview')
    .select('*');

  if (error) {
    console.error('❌ Error querying view:', error.message);
    console.log('\n💡 The view might not exist. Let me check contacts_sync table instead:\n');

    const { data: tableData, error: tableError } = await supabase
      .from('contacts_sync')
      .select('*');

    if (tableError) {
      console.error('❌ Error querying table:', tableError.message);
    } else {
      console.log(`✅ Found ${tableData?.length || 0} contacts in contacts_sync table`);
      tableData?.forEach(c => console.log(`   - ${c.first_name} ${c.last_name}`));
    }
  } else {
    console.log(`✅ View exists with ${data?.length || 0} records`);
    data?.forEach(c => console.log(`   - ${c.first_name} ${c.last_name}`));
  }
}

checkView().catch(console.error);
