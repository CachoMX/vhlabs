// Check what data exists in the database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxieuybdhngkkkmaxpsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aWV1eWJkaG5na2trbWF4cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjU2NjMsImV4cCI6MjA4MTc0MTY2M30.Iz810S-OLictocvT_Hx3rZI7jhIkgPCTcJq9OEBVt5o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('🔍 Checking database data...\n');

  // Check contacts
  const { data: contacts, error: contactError } = await supabase
    .from('contacts_sync')
    .select('*');

  console.log('👥 Contacts:');
  if (contactError) {
    console.error('Error:', contactError.message);
  } else {
    console.log(`   Found ${contacts?.length || 0} contacts`);
    contacts?.forEach(c => console.log(`   - ${c.first_name} ${c.last_name} (${c.email})`));
  }
  console.log();

  // Check distributions
  const { data: distributions, error: distError } = await supabase
    .from('distributions')
    .select('*');

  console.log('📨 Distributions:');
  if (distError) {
    console.error('Error:', distError.message);
  } else {
    console.log(`   Found ${distributions?.length || 0} distributions`);
    distributions?.forEach(d => console.log(`   - ${d.channel}: ${d.status}`));
  }
  console.log();

  // Check content
  const { data: content, error: contentError } = await supabase
    .from('contents')
    .select('*');

  console.log('📄 Content:');
  if (contentError) {
    console.error('Error:', contentError.message);
  } else {
    console.log(`   Found ${content?.length || 0} content pieces`);
    content?.forEach(c => console.log(`   - ${c.title}`));
  }
  console.log();

  // Check prompts
  const { data: prompts, error: promptError } = await supabase
    .from('prompts')
    .select('*');

  console.log('📝 Prompts:');
  if (promptError) {
    console.error('Error:', promptError.message);
  } else {
    console.log(`   Found ${prompts?.length || 0} prompts`);
    prompts?.forEach(p => console.log(`   - ${p.name}`));
  }
}

checkData().catch(console.error);
