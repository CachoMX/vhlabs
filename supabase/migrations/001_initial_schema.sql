-- Austin CG Investor Engagement Platform
-- Supabase Schema v1.0
-- Created: December 2024

-- ============================================
-- REFERENCE TABLES
-- ============================================

-- Audience segments reference
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT, -- Slack reaction emoji
  routing_rules JSONB DEFAULT '{}',
  channel_primary TEXT,
  channel_secondary TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed segments
INSERT INTO segments (slug, name, description, emoji, channel_primary, channel_secondary) VALUES
  ('re_investors', 'RE Investors', 'Active property buyers/flippers', '🏠', 'email', 'instagram'),
  ('house_buyers', 'House Buyers', 'End-users seeking homes', '🏡', 'sms', 'email'),
  ('bird_doggers', 'Bird Doggers', 'Deal scouts (finders fees)', '🐶', 'email', 'slack'),
  ('jv_partners', 'JV Partners', 'Joint venture seekers', '🤝', 'email', 'linkedin'),
  ('coaching_students', 'Coaching Students', 'Pace''s group enrollees', '📚', 'email', 'instagram'),
  ('wholesalers', 'Wholesalers', 'Deal flippers', '💰', 'email', 'instagram'),
  ('lenders', 'Lenders', 'Funding providers', '🏦', 'email', 'linkedin'),
  ('sellers', 'Sellers', 'Property owners listing', '📝', 'sms', 'email'),
  ('general_leads', 'General Leads', 'Unsegmented prospects', '❓', 'email', 'instagram');

-- Investor status taxonomy
CREATE TABLE investor_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  signals TEXT[], -- Example signals that indicate this status
  touchpoint_frequency_days INT,
  priority_level INT DEFAULT 5, -- 1 = highest priority
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed investor statuses
INSERT INTO investor_statuses (slug, name, description, signals, touchpoint_frequency_days, priority_level) VALUES
  ('hot_lead', 'Hot Lead', 'Strong buying intent, <3mo timeline', ARRAY['ready to close', 'looking now', 'specific property interest'], 5, 1),
  ('active_investor', 'Active Investor', 'High engagement, recent activity', ARRAY['multiple interactions', 'deal discussions', 'asks questions'], 10, 2),
  ('passive_investor', 'Passive Investor', 'Interested but not leading', ARRAY['open to opportunities', 'maybe later', 'keeping options open'], 21, 3),
  ('jv_potential', 'JV Potential', 'Joint venture interest', ARRAY['looking for partners', 'capital discussions', 'wants to team up'], 14, 2),
  ('tire_kicker', 'Tire Kicker', 'Low intent, browsing only', ARRAY['just curious', 'no follow-through', 'vague interest'], 30, 5),
  ('objection_holder', 'Objection Holder', 'Expressed barriers', ARRAY['too expensive', 'bad timing', 'specific concerns'], 30, 4),
  ('dormant', 'Dormant', 'Past engagement, inactive >6mo', ARRAY['no response', 'dropped off'], 45, 6),
  ('cold', 'Cold', 'No response history', ARRAY['never engaged'], NULL, 7);

-- ============================================
-- PROMPTS LIBRARY
-- ============================================

CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id TEXT NOT NULL, -- e.g., 'setter_update_base'
  version INT DEFAULT 1,
  system TEXT NOT NULL, -- 'system1', 'system2', 'system3', 'system4'
  category TEXT, -- 'setter', 'content_agent', 'teaser', etc.
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  variables TEXT[], -- Expected variables like ['name', 'segment', 'last_note']
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prompt_id, version)
);

-- Index for quick active prompt lookup
CREATE INDEX idx_prompts_active ON prompts(prompt_id, is_active) WHERE is_active = true;

-- ============================================
-- CONTENT LIBRARY
-- ============================================

CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source information
  source_url TEXT,
  source_type TEXT CHECK (source_type IN ('call', 'workshop', 'video', 'podcast', 'other')),
  slack_channel_id TEXT,
  slack_message_ts TEXT,
  slack_reactions JSONB DEFAULT '[]', -- Array of reactions added
  
  -- Basic metadata
  title TEXT,
  description TEXT,
  duration_seconds INT,
  
  -- Processed content
  transcript_raw TEXT,
  transcript_structured JSONB, -- {speakers: [], topics: [], summary: ''}
  hooks JSONB DEFAULT '[]', -- Array of extracted hooks
  clips JSONB DEFAULT '[]', -- Array of clip timestamps
  
  -- Targeting
  audiences TEXT[] DEFAULT '{}', -- Array of segment slugs
  content_type TEXT, -- 'educational', 'motivational', 'case_study', 'qa', 'other'
  is_evergreen BOOLEAN DEFAULT true,
  
  -- Scoring
  score INT DEFAULT 50,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  is_featured BOOLEAN DEFAULT false,
  
  -- Processing status
  status TEXT CHECK (status IN ('pending', 'processing', 'ready', 'distributed', 'archived')) DEFAULT 'pending',
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  processing_error TEXT,
  
  -- AI metadata
  ai_metadata JSONB DEFAULT '{}', -- Full AI extraction response
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for content queries
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_priority ON contents(priority, score DESC);
CREATE INDEX idx_contents_audiences ON contents USING GIN(audiences);
CREATE INDEX idx_contents_slack ON contents(slack_channel_id, slack_message_ts);

-- ============================================
-- HOOKS (for reuse tracking)
-- ============================================

CREATE TABLE hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  
  text TEXT NOT NULL,
  timestamp TEXT, -- Position in source content
  hook_type TEXT, -- 'insight', 'quote', 'statistic', 'story', 'call_to_action'
  
  -- Usage tracking
  used_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Performance (optional tracking)
  engagement_score FLOAT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hooks_content ON hooks(content_id);
CREATE INDEX idx_hooks_type ON hooks(hook_type);

-- ============================================
-- GHL CONTACT SYNC
-- ============================================

CREATE TABLE contacts_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_id TEXT UNIQUE NOT NULL,
  ghl_location_id TEXT,
  
  -- Basic info
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  
  -- Segmentation
  segment TEXT REFERENCES segments(slug),
  investor_status TEXT REFERENCES investor_statuses(slug),
  
  -- Scoring
  score INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  
  -- Activity tracking
  last_touchpoint_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ,
  touchpoint_count INT DEFAULT 0,
  response_count INT DEFAULT 0,
  
  -- Notes
  latest_notes TEXT,
  parsed_notes JSONB, -- AI-parsed note data
  
  -- Sync metadata
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  sync_status TEXT DEFAULT 'active',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contacts_ghl ON contacts_sync(ghl_id);
CREATE INDEX idx_contacts_segment ON contacts_sync(segment);
CREATE INDEX idx_contacts_status ON contacts_sync(investor_status);
CREATE INDEX idx_contacts_score ON contacts_sync(score DESC);

-- ============================================
-- DISTRIBUTION TRACKING
-- ============================================

CREATE TABLE distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  content_id UUID REFERENCES contents(id),
  contact_sync_id UUID REFERENCES contacts_sync(id),
  ghl_contact_id TEXT, -- Direct GHL reference
  
  -- Distribution details
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'instagram', 'linkedin', 'slack')),
  message_type TEXT, -- 'teaser', 'followup', 'reminder', 'cross_promo'
  
  -- Content
  subject TEXT, -- For email
  message_content TEXT,
  media_url TEXT, -- Video/image link
  
  -- External references
  external_id TEXT, -- GHL message ID, IG post ID, etc.
  external_url TEXT, -- Link to the actual post/message
  
  -- Engagement tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Response
  response_received BOOLEAN DEFAULT false,
  response_text TEXT,
  response_at TIMESTAMPTZ,
  response_sentiment TEXT, -- 'positive', 'neutral', 'negative', 'objection'
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'delivered', 'failed', 'bounced')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_distributions_content ON distributions(content_id);
CREATE INDEX idx_distributions_contact ON distributions(ghl_contact_id);
CREATE INDEX idx_distributions_channel ON distributions(channel);
CREATE INDEX idx_distributions_status ON distributions(status);
CREATE INDEX idx_distributions_sent ON distributions(sent_at DESC);

-- ============================================
-- TOUCHPOINT QUEUE
-- ============================================

CREATE TABLE touchpoint_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  contact_sync_id UUID REFERENCES contacts_sync(id),
  ghl_contact_id TEXT NOT NULL,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  channel TEXT NOT NULL,
  message_type TEXT DEFAULT 'update',
  
  -- Content (can be pre-generated or generated at send time)
  message_content TEXT,
  template_id TEXT, -- Reference to template if using one
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'cancelled', 'failed')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Result
  distribution_id UUID REFERENCES distributions(id),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_touchpoint_queue_scheduled ON touchpoint_queue(scheduled_for, status) WHERE status = 'pending';
CREATE INDEX idx_touchpoint_queue_contact ON touchpoint_queue(ghl_contact_id);

-- ============================================
-- ANALYTICS EVENTS
-- ============================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_type TEXT NOT NULL, -- 'content_processed', 'message_sent', 'response_received', etc.
  event_category TEXT, -- 'system1', 'system2', 'system3', 'system4'
  
  -- Context
  workflow_name TEXT,
  content_id UUID,
  contact_id TEXT,
  distribution_id UUID,
  
  -- Event data
  event_data JSONB DEFAULT '{}',
  
  -- Performance
  duration_ms INT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_category ON analytics_events(event_category);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- ============================================
-- WORKFLOW LOGS
-- ============================================

CREATE TABLE workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  workflow_id TEXT NOT NULL, -- n8n workflow ID
  workflow_name TEXT,
  execution_id TEXT, -- n8n execution ID
  
  -- Status
  status TEXT CHECK (status IN ('started', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Data
  input_data JSONB,
  output_data JSONB,
  error_data JSONB,
  
  -- Metrics
  nodes_executed INT,
  duration_ms INT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workflow_logs_workflow ON workflow_logs(workflow_id);
CREATE INDEX idx_workflow_logs_status ON workflow_logs(status);
CREATE INDEX idx_workflow_logs_created ON workflow_logs(created_at DESC);

-- ============================================
-- TEMPLATES
-- ============================================

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  template_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'email_teaser', 'sms_update', 'ig_caption', etc.
  segment TEXT REFERENCES segments(slug), -- Optional: segment-specific template
  investor_status TEXT REFERENCES investor_statuses(slug), -- Optional: status-specific
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template content
  subject TEXT, -- For emails
  body TEXT NOT NULL,
  variables TEXT[], -- Expected variables
  
  -- Usage tracking
  used_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Performance (optional A/B tracking)
  open_rate FLOAT,
  click_rate FLOAT,
  response_rate FLOAT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_segment ON templates(segment);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON segments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts_sync FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_distributions_updated_at BEFORE UPDATE ON distributions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (Optional - enable per table as needed)
-- ============================================

-- Example: Enable RLS on sensitive tables
-- ALTER TABLE contacts_sync ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Service role has full access" ON contacts_sync FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- VIEWS
-- ============================================

-- Active content ready for distribution
CREATE VIEW v_content_ready AS
SELECT 
  c.*,
  array_length(c.audiences, 1) as audience_count,
  (SELECT COUNT(*) FROM hooks h WHERE h.content_id = c.id) as hook_count
FROM contents c
WHERE c.status = 'ready'
ORDER BY c.priority DESC, c.score DESC, c.created_at DESC;

-- Contact overview with latest activity
CREATE VIEW v_contact_overview AS
SELECT 
  cs.*,
  s.name as segment_name,
  ist.name as status_name,
  ist.touchpoint_frequency_days,
  (SELECT COUNT(*) FROM distributions d WHERE d.ghl_contact_id = cs.ghl_id) as total_distributions,
  (SELECT COUNT(*) FROM distributions d WHERE d.ghl_contact_id = cs.ghl_id AND d.response_received = true) as total_responses
FROM contacts_sync cs
LEFT JOIN segments s ON cs.segment = s.slug
LEFT JOIN investor_statuses ist ON cs.investor_status = ist.slug;

-- Distribution performance summary
CREATE VIEW v_distribution_performance AS
SELECT 
  channel,
  message_type,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked,
  COUNT(*) FILTER (WHERE response_received = true) as responded,
  ROUND(100.0 * COUNT(*) FILTER (WHERE opened_at IS NOT NULL) / NULLIF(COUNT(*), 0), 2) as open_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) / NULLIF(COUNT(*), 0), 2) as click_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE response_received = true) / NULLIF(COUNT(*), 0), 2) as response_rate
FROM distributions
WHERE sent_at IS NOT NULL
GROUP BY channel, message_type;
