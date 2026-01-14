// Seed sample data for VH Labs Dashboard
// Run with: node seed-data.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxieuybdhngkkkmaxpsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aWV1eWJkaG5na2trbWF4cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjU2NjMsImV4cCI6MjA4MTc0MTY2M30.Iz810S-OLictocvT_Hx3rZI7jhIkgPCTcJq9OEBVt5o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log('🌱 Seeding sample data...\n');

  // 1. Add sample prompts
  console.log('📝 Adding sample prompts...');
  const { data: prompts, error: promptError } = await supabase
    .from('prompts')
    .insert([
      {
        prompt_id: 'content_agent_v1',
        version: 1,
        system: 'system2',
        category: 'content_agent',
        name: 'Content Hook Extractor',
        description: 'Extracts hooks, clips, and metadata from call recordings',
        content: 'You are a content intelligence agent. Extract valuable hooks and clips from the following transcript:\n\n{transcript}\n\nReturn JSON with hooks, clips, and metadata.',
        variables: ['transcript'],
        is_active: true
      },
      {
        prompt_id: 'teaser_generator_v1',
        version: 1,
        system: 'system3',
        category: 'teaser',
        name: 'Email Teaser Generator',
        description: 'Generates engaging email teasers for content',
        content: 'Create an engaging email teaser for this content:\n\nTitle: {title}\nDescription: {description}\nAudience: {audience}\n\nKeep it under 100 words and include a compelling CTA.',
        variables: ['title', 'description', 'audience'],
        is_active: true
      },
      {
        prompt_id: 'setter_update_base',
        version: 1,
        system: 'system1',
        category: 'setter',
        name: 'AI Setter Base Prompt',
        description: 'Base prompt for conversational AI setter',
        content: 'You are a friendly relationship manager. Send a casual check-in to {name} from the {segment} segment. Reference their last interaction: {last_note}',
        variables: ['name', 'segment', 'last_note'],
        is_active: true
      }
    ]);

  if (promptError) {
    console.error('Error adding prompts:', promptError.message);
  } else {
    console.log('✅ Added 3 sample prompts\n');
  }

  // 2. Add sample contacts
  console.log('👥 Adding sample contacts...');
  const { data: contacts, error: contactError } = await supabase
    .from('contacts_sync')
    .insert([
      {
        ghl_id: 'GHL001',
        email: 'john.investor@example.com',
        phone: '+1234567890',
        first_name: 'John',
        last_name: 'Investor',
        segment: 're_investors',
        investor_status: 'active_investor',
        score: 85,
        tags: ['high-value', 'multifamily'],
        touchpoint_count: 12,
        response_count: 8,
        last_touchpoint_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        last_response_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        sync_status: 'active'
      },
      {
        ghl_id: 'GHL002',
        email: 'sarah.partner@example.com',
        phone: '+1234567891',
        first_name: 'Sarah',
        last_name: 'Partner',
        segment: 'jv_partners',
        investor_status: 'hot_lead',
        score: 92,
        tags: ['capital-partner', 'experienced'],
        touchpoint_count: 5,
        response_count: 4,
        last_touchpoint_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        last_response_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        sync_status: 'active'
      },
      {
        ghl_id: 'GHL003',
        email: 'mike.wholesaler@example.com',
        phone: '+1234567892',
        first_name: 'Mike',
        last_name: 'Wholesaler',
        segment: 'wholesalers',
        investor_status: 'passive_investor',
        score: 65,
        tags: ['deal-finder'],
        touchpoint_count: 8,
        response_count: 3,
        last_touchpoint_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        last_response_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        sync_status: 'active'
      }
    ]);

  if (contactError) {
    console.error('Error adding contacts:', contactError.message);
  } else {
    console.log('✅ Added 3 sample contacts\n');
  }

  // 3. Add sample content
  console.log('📄 Adding sample content...');
  const { data: content, error: contentError } = await supabase
    .from('contents')
    .insert([
      {
        title: 'Multifamily Investment Strategy Workshop',
        description: 'Deep dive into multifamily investing strategies and market analysis',
        source_type: 'workshop',
        source_url: 'https://example.com/workshop-recording',
        audiences: ['re_investors', 'jv_partners'],
        content_type: 'educational',
        status: 'ready',
        priority: 'high',
        score: 88,
        is_featured: true,
        is_evergreen: true,
        hooks: JSON.stringify([
          { text: 'The biggest mistake investors make in multifamily deals', timestamp: '00:05:23' },
          { text: 'How to analyze cash flow in 5 minutes', timestamp: '00:12:45' }
        ]),
        clips: JSON.stringify([
          { start: '00:05:00', end: '00:06:30', description: 'Common mistakes segment' }
        ]),
        processing_completed_at: new Date().toISOString()
      },
      {
        title: 'Market Update Q4 2024',
        description: 'Latest market trends and opportunities in real estate',
        source_type: 'call',
        source_url: 'https://example.com/market-update',
        audiences: ['re_investors', 'wholesalers', 'lenders'],
        content_type: 'case_study',
        status: 'ready',
        priority: 'medium',
        score: 75,
        is_featured: false,
        is_evergreen: false,
        hooks: JSON.stringify([
          { text: 'Interest rates are creating unprecedented opportunities', timestamp: '00:02:10' }
        ]),
        processing_completed_at: new Date().toISOString()
      }
    ]);

  if (contentError) {
    console.error('Error adding content:', contentError.message);
  } else {
    console.log('✅ Added 2 sample content pieces\n');
  }

  // 4. Add sample distributions
  console.log('📨 Adding sample distributions...');

  // Get the content IDs we just created
  const { data: contentData } = await supabase
    .from('contents')
    .select('id')
    .limit(2);

  if (contentData && contentData.length > 0) {
    const { error: distError } = await supabase
      .from('distributions')
      .insert([
        {
          content_id: contentData[0].id,
          ghl_contact_id: 'GHL001',
          channel: 'email',
          message_type: 'teaser',
          subject: 'New Workshop: Multifamily Investment Strategies',
          message_content: 'Hey John, just dropped a new workshop...',
          status: 'delivered',
          sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          delivered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          opened_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          clicked_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          response_received: true,
          response_text: 'This looks great! When is the next one?',
          response_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          content_id: contentData[0].id,
          ghl_contact_id: 'GHL002',
          channel: 'email',
          message_type: 'teaser',
          subject: 'New Workshop: Multifamily Investment Strategies',
          message_content: 'Hey Sarah, thought you might be interested...',
          status: 'delivered',
          sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          delivered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          opened_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          content_id: contentData[1]?.id || contentData[0].id,
          ghl_contact_id: 'GHL001',
          channel: 'sms',
          message_type: 'followup',
          message_content: 'Quick market update - check your email!',
          status: 'delivered',
          sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          delivered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

    if (distError) {
      console.error('Error adding distributions:', distError.message);
    } else {
      console.log('✅ Added 3 sample distributions\n');
    }
  }

  // 5. Add sample analytics events
  console.log('📊 Adding sample analytics events...');
  const { error: analyticsError } = await supabase
    .from('analytics_events')
    .insert([
      {
        event_type: 'content_processed',
        event_category: 'system2',
        workflow_name: 'Content Processing Pipeline',
        success: true,
        duration_ms: 5420,
        event_data: JSON.stringify({ hooks_extracted: 2, clips_identified: 1 })
      },
      {
        event_type: 'message_sent',
        event_category: 'system3',
        workflow_name: 'Email Distribution',
        success: true,
        duration_ms: 1230,
        event_data: JSON.stringify({ channel: 'email', recipients: 2 })
      },
      {
        event_type: 'response_received',
        event_category: 'system1',
        workflow_name: 'Response Handler',
        success: true,
        duration_ms: 850,
        event_data: JSON.stringify({ sentiment: 'positive' })
      }
    ]);

  if (analyticsError) {
    console.error('Error adding analytics:', analyticsError.message);
  } else {
    console.log('✅ Added 3 sample analytics events\n');
  }

  console.log('🎉 Sample data seeded successfully!\n');
  console.log('You can now explore:');
  console.log('  - Dashboard: http://localhost:5178/');
  console.log('  - Content: http://localhost:5178/content');
  console.log('  - Distributions: http://localhost:5178/distributions');
  console.log('  - Contacts: http://localhost:5178/contacts');
  console.log('  - Prompts: http://localhost:5178/prompts');
  console.log('  - Analytics: http://localhost:5178/analytics');
}

seedData().catch(console.error);
