// Check if the test event was inserted
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxieuybdhngkkkmaxpsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aWV1eWJkaG5na2trbWF4cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjU2NjMsImV4cCI6MjA4MTc0MTY2M30.Iz810S-OLictocvT_Hx3rZI7jhIkgPCTcJq9OEBVt5o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAnalytics() {
  console.log('🔍 Checking analytics_events table...\n');

  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`✅ Found ${data?.length || 0} recent events:\n`);

  data?.forEach((event, i) => {
    console.log(`${i + 1}. Event Type: ${event.event_type}`);
    console.log(`   Category: ${event.event_category}`);
    console.log(`   Workflow: ${event.workflow_name}`);
    console.log(`   Success: ${event.success ? '✅' : '❌'}`);
    console.log(`   Created: ${new Date(event.created_at).toLocaleString()}`);
    console.log('');
  });

  // Check for test events specifically
  const { data: testEvents } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('event_type', 'test_event');

  console.log(`\n🧪 Test events from n8n: ${testEvents?.length || 0}`);
  if (testEvents && testEvents.length > 0) {
    console.log('✅ n8n successfully inserted test events!');
  } else {
    console.log('⚠️  No test events found - n8n insert may have failed');
  }
}

checkAnalytics().catch(console.error);
