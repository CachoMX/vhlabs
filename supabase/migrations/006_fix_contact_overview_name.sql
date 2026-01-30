-- Fix v_contact_overview to include computed 'name' column
-- This allows searching by full name easily

DROP VIEW IF EXISTS v_contact_overview;

CREATE VIEW v_contact_overview AS
SELECT
  cs.*,
  -- Computed name column (first_name + last_name)
  CONCAT_WS(' ', cs.first_name, cs.last_name) as name,
  s.name as segment_name,
  ist.name as status_name,
  (SELECT COUNT(*) FROM distributions d WHERE d.ghl_contact_id = cs.ghl_id) as total_distributions,
  (SELECT COUNT(*) FROM distributions d WHERE d.ghl_contact_id = cs.ghl_id AND d.response_received = true) as total_responses
FROM contacts_sync cs
LEFT JOIN segments s ON cs.segment = s.slug
LEFT JOIN investor_statuses ist ON cs.investor_status = ist.slug;
