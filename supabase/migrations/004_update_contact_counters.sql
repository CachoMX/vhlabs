-- Migration to automatically update contact response and touchpoint counters
-- This ensures that response_count, touchpoint_count, last_response_at, and last_touchpoint_at
-- are automatically updated when distributions are created or updated

-- Function to update contact counters when a distribution changes
CREATE OR REPLACE FUNCTION update_contact_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the contact based on the ghl_contact_id
  UPDATE contacts_sync
  SET
    -- Count total distributions (touchpoints)
    touchpoint_count = (
      SELECT COUNT(*)
      FROM distributions
      WHERE ghl_contact_id = NEW.ghl_contact_id
        AND sent_at IS NOT NULL
    ),
    -- Count responses
    response_count = (
      SELECT COUNT(*)
      FROM distributions
      WHERE ghl_contact_id = NEW.ghl_contact_id
        AND response_received = true
    ),
    -- Get last touchpoint date
    last_touchpoint_at = (
      SELECT MAX(sent_at)
      FROM distributions
      WHERE ghl_contact_id = NEW.ghl_contact_id
        AND sent_at IS NOT NULL
    ),
    -- Get last response date
    last_response_at = (
      SELECT MAX(response_at)
      FROM distributions
      WHERE ghl_contact_id = NEW.ghl_contact_id
        AND response_received = true
        AND response_at IS NOT NULL
    )
  WHERE ghl_id = NEW.ghl_contact_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT or UPDATE of distributions
DROP TRIGGER IF EXISTS trigger_update_contact_counters_on_distribution ON distributions;
CREATE TRIGGER trigger_update_contact_counters_on_distribution
AFTER INSERT OR UPDATE ON distributions
FOR EACH ROW
EXECUTE FUNCTION update_contact_counters();

-- Backfill existing data: Update all contacts based on their current distributions
UPDATE contacts_sync cs
SET
  touchpoint_count = COALESCE((
    SELECT COUNT(*)
    FROM distributions d
    WHERE d.ghl_contact_id = cs.ghl_id
      AND d.sent_at IS NOT NULL
  ), 0),
  response_count = COALESCE((
    SELECT COUNT(*)
    FROM distributions d
    WHERE d.ghl_contact_id = cs.ghl_id
      AND d.response_received = true
  ), 0),
  last_touchpoint_at = (
    SELECT MAX(sent_at)
    FROM distributions d
    WHERE d.ghl_contact_id = cs.ghl_id
      AND d.sent_at IS NOT NULL
  ),
  last_response_at = (
    SELECT MAX(response_at)
    FROM distributions d
    WHERE d.ghl_contact_id = cs.ghl_id
      AND d.response_received = true
      AND d.response_at IS NOT NULL
  );
