-- Supabase Functions for Austin CG Platform
-- Run this AFTER the initial schema and prompt seed

-- ============================================
-- FUNCTION: Get contacts due for touchpoint
-- Used by S1-03 Touchpoint Scheduler
-- ============================================

CREATE OR REPLACE FUNCTION get_contacts_due_for_touchpoint(check_date TIMESTAMPTZ DEFAULT NOW())
RETURNS TABLE (
  id UUID,
  ghl_id TEXT,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  segment TEXT,
  investor_status TEXT,
  latest_notes TEXT,
  preferred_channel TEXT,
  last_touchpoint_at TIMESTAMPTZ,
  touchpoint_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.ghl_id,
    cs.email,
    cs.phone,
    cs.first_name,
    cs.last_name,
    cs.segment,
    cs.investor_status,
    cs.latest_notes,
    COALESCE(s.channel_primary, 'email') as preferred_channel,
    cs.last_touchpoint_at,
    COALESCE(cs.touchpoint_count, 0)::INT as touchpoint_count
  FROM contacts_sync cs
  JOIN investor_statuses ist ON cs.investor_status = ist.slug
  LEFT JOIN segments s ON cs.segment = s.slug
  WHERE 
    -- Has a touchpoint frequency defined
    ist.touchpoint_frequency_days IS NOT NULL
    -- Not cold or opted out
    AND cs.investor_status NOT IN ('cold')
    AND COALESCE(cs.sync_status, 'active') != 'opted_out'
    -- Due for touchpoint
    AND (
      cs.last_touchpoint_at IS NULL
      OR cs.last_touchpoint_at + (ist.touchpoint_frequency_days || ' days')::INTERVAL <= check_date
    )
  ORDER BY 
    ist.priority_level ASC, -- Highest priority first
    cs.last_touchpoint_at ASC NULLS FIRST -- Oldest/never touched first
  LIMIT 100; -- Safety limit
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Get content ready for distribution
-- Used by S3-01 Distribution Router
-- ============================================

CREATE OR REPLACE FUNCTION get_content_ready_for_distribution(
  limit_count INT DEFAULT 10,
  min_score INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  source_url TEXT,
  title TEXT,
  audiences TEXT[],
  hooks JSONB,
  score INT,
  priority TEXT,
  is_featured BOOLEAN,
  ai_metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.source_url,
    COALESCE(c.title, c.ai_metadata->>'headline', 'Untitled') as title,
    c.audiences,
    c.hooks,
    COALESCE(c.score, 50)::INT as score,
    c.priority,
    c.is_featured,
    c.ai_metadata
  FROM contents c
  WHERE 
    c.status = 'ready'
    AND COALESCE(c.score, 50) >= min_score
  ORDER BY 
    c.is_featured DESC,
    CASE c.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
    c.score DESC,
    c.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Get distribution stats
-- Used by dashboard
-- ============================================

CREATE OR REPLACE FUNCTION get_distribution_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  channel TEXT,
  total_sent BIGINT,
  total_opened BIGINT,
  total_clicked BIGINT,
  total_responded BIGINT,
  open_rate NUMERIC,
  click_rate NUMERIC,
  response_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.channel,
    COUNT(*)::BIGINT as total_sent,
    COUNT(*) FILTER (WHERE d.opened_at IS NOT NULL)::BIGINT as total_opened,
    COUNT(*) FILTER (WHERE d.clicked_at IS NOT NULL)::BIGINT as total_clicked,
    COUNT(*) FILTER (WHERE d.response_received = true)::BIGINT as total_responded,
    ROUND(
      COUNT(*) FILTER (WHERE d.opened_at IS NOT NULL)::NUMERIC / 
      NULLIF(COUNT(*), 0) * 100, 2
    ) as open_rate,
    ROUND(
      COUNT(*) FILTER (WHERE d.clicked_at IS NOT NULL)::NUMERIC / 
      NULLIF(COUNT(*), 0) * 100, 2
    ) as click_rate,
    ROUND(
      COUNT(*) FILTER (WHERE d.response_received = true)::NUMERIC / 
      NULLIF(COUNT(*), 0) * 100, 2
    ) as response_rate
  FROM distributions d
  WHERE 
    d.sent_at BETWEEN start_date AND end_date
    AND d.status = 'sent'
  GROUP BY d.channel;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Update content score
-- Called after processing
-- ============================================

CREATE OR REPLACE FUNCTION calculate_content_score(content_id UUID)
RETURNS INT AS $$
DECLARE
  base_score INT := 50;
  hook_count INT;
  priority_bonus INT;
  featured_bonus INT;
  final_score INT;
BEGIN
  -- Count hooks
  SELECT COALESCE(jsonb_array_length(hooks), 0) INTO hook_count
  FROM contents WHERE id = content_id;
  
  -- Get priority bonus
  SELECT CASE priority 
    WHEN 'high' THEN 15 
    WHEN 'medium' THEN 5 
    ELSE 0 
  END INTO priority_bonus
  FROM contents WHERE id = content_id;
  
  -- Get featured bonus
  SELECT CASE WHEN is_featured THEN 20 ELSE 0 END INTO featured_bonus
  FROM contents WHERE id = content_id;
  
  -- Calculate final score
  final_score := base_score + 
                 LEAST(hook_count * 5, 25) + -- Max 25 from hooks
                 priority_bonus + 
                 featured_bonus;
  
  -- Update the content
  UPDATE contents SET score = final_score WHERE id = content_id;
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-update timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that have updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT table_name FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON %I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    ', t, t);
  END LOOP;
END;
$$;

-- ============================================
-- Add missing columns if not present
-- ============================================

-- contacts_sync additions
ALTER TABLE contacts_sync 
ADD COLUMN IF NOT EXISTS touchpoint_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS response_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_response_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'active';

-- distributions additions
ALTER TABLE distributions
ADD COLUMN IF NOT EXISTS response_received BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS response_text TEXT,
ADD COLUMN IF NOT EXISTS response_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS response_sentiment TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- touchpoint_queue additions
ALTER TABLE touchpoint_queue
ADD COLUMN IF NOT EXISTS contact_sync_id UUID REFERENCES contacts_sync(id),
ADD COLUMN IF NOT EXISTS message_type TEXT,
ADD COLUMN IF NOT EXISTS distribution_id UUID REFERENCES distributions(id);

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_contacts_sync_status ON contacts_sync(investor_status);
CREATE INDEX IF NOT EXISTS idx_contacts_sync_segment ON contacts_sync(segment);
CREATE INDEX IF NOT EXISTS idx_contacts_sync_touchpoint ON contacts_sync(last_touchpoint_at);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_score ON contents(score DESC);
CREATE INDEX IF NOT EXISTS idx_distributions_status ON distributions(status);
CREATE INDEX IF NOT EXISTS idx_distributions_sent ON distributions(sent_at);
CREATE INDEX IF NOT EXISTS idx_touchpoint_queue_status ON touchpoint_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_prompts_active ON prompts(prompt_id, is_active);
