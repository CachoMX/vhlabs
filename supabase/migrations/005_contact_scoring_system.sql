-- Contact Scoring System
-- Calculates engagement score for contacts based on:
-- - Responses (highest weight)
-- - Touchpoint frequency
-- - Recent activity
-- - Email opens/clicks
-- - Investor status

-- Function to calculate contact score
CREATE OR REPLACE FUNCTION calculate_contact_score(contact_ghl_id TEXT)
RETURNS INT AS $$
DECLARE
  base_score INT := 0;
  response_score INT := 0;
  touchpoint_score INT := 0;
  recency_score INT := 0;
  engagement_score INT := 0;
  status_score INT := 0;
  final_score INT;

  -- Variables for calculations
  response_count INT;
  touchpoint_count INT;
  response_rate FLOAT;
  days_since_last_response INT;
  days_since_last_touchpoint INT;
  opened_count INT;
  clicked_count INT;
  current_status TEXT;
BEGIN
  -- Get contact data
  SELECT
    c.response_count,
    c.touchpoint_count,
    c.investor_status,
    EXTRACT(DAY FROM NOW() - c.last_response_at) as days_since_response,
    EXTRACT(DAY FROM NOW() - c.last_touchpoint_at) as days_since_touchpoint
  INTO
    response_count,
    touchpoint_count,
    current_status,
    days_since_last_response,
    days_since_last_touchpoint
  FROM contacts_sync c
  WHERE c.ghl_id = contact_ghl_id;

  -- Get email engagement metrics
  SELECT
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opens,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicks
  INTO
    opened_count,
    clicked_count
  FROM distributions
  WHERE ghl_contact_id = contact_ghl_id;

  -- Calculate response score (0-40 points)
  -- Each response is worth 10 points, max 40
  response_score := LEAST(response_count * 10, 40);

  -- Calculate response rate bonus (0-20 points)
  IF touchpoint_count > 0 THEN
    response_rate := response_count::FLOAT / touchpoint_count::FLOAT;
    touchpoint_score := ROUND(response_rate * 20)::INT;
  END IF;

  -- Calculate recency score (0-20 points)
  -- Recent activity is weighted higher
  IF days_since_last_response IS NOT NULL THEN
    IF days_since_last_response < 7 THEN
      recency_score := 20;
    ELSIF days_since_last_response < 30 THEN
      recency_score := 15;
    ELSIF days_since_last_response < 90 THEN
      recency_score := 10;
    ELSE
      recency_score := 5;
    END IF;
  ELSIF days_since_last_touchpoint IS NOT NULL THEN
    -- If no response but recent touchpoint
    IF days_since_last_touchpoint < 7 THEN
      recency_score := 5;
    END IF;
  END IF;

  -- Calculate email engagement score (0-15 points)
  -- Opens: 5 points max, Clicks: 10 points max
  engagement_score := LEAST(opened_count, 5) + LEAST(clicked_count * 2, 10);

  -- Calculate status bonus (0-5 points)
  -- Hot leads and active investors get bonus points
  status_score := CASE current_status
    WHEN 'hot_lead' THEN 5
    WHEN 'active_investor' THEN 5
    WHEN 'jv_potential' THEN 4
    WHEN 'passive_investor' THEN 3
    WHEN 'objection_holder' THEN 2
    WHEN 'tire_kicker' THEN 1
    WHEN 'dormant' THEN 0
    WHEN 'cold' THEN 0
    ELSE 2
  END;

  -- Calculate final score (max 100)
  final_score := LEAST(
    response_score +
    touchpoint_score +
    recency_score +
    engagement_score +
    status_score,
    100
  );

  -- Update the contact score
  UPDATE contacts_sync
  SET score = final_score
  WHERE ghl_id = contact_ghl_id;

  RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate all contact scores
CREATE OR REPLACE FUNCTION recalculate_all_contact_scores()
RETURNS TABLE(ghl_id TEXT, score INT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.ghl_id,
    calculate_contact_score(c.ghl_id)
  FROM contacts_sync c;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update score when distributions change
CREATE OR REPLACE FUNCTION trigger_update_contact_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate score after distribution changes
  PERFORM calculate_contact_score(NEW.ghl_contact_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on distributions table
DROP TRIGGER IF EXISTS trigger_update_score_on_distribution ON distributions;
CREATE TRIGGER trigger_update_score_on_distribution
AFTER INSERT OR UPDATE ON distributions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_contact_score();

-- Backfill: Calculate scores for all existing contacts
SELECT recalculate_all_contact_scores();
