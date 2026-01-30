-- Migration: Contact Aggregation Functions
-- Description: Create SQL functions for server-side aggregation to avoid 1000-record Supabase limit
-- Date: 2026-01-29

-- Function to get segment counts
CREATE OR REPLACE FUNCTION get_segment_counts()
RETURNS TABLE (
  segment TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(cs.segment, 'unassigned') as segment,
    COUNT(*) as count
  FROM contacts_sync cs
  GROUP BY COALESCE(cs.segment, 'unassigned')
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get investor status counts
CREATE OR REPLACE FUNCTION get_status_counts()
RETURNS TABLE (
  investor_status TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(cs.investor_status, 'unassigned') as investor_status,
    COUNT(*) as count
  FROM contacts_sync cs
  GROUP BY COALESCE(cs.investor_status, 'unassigned')
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_segment_counts() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_status_counts() TO authenticated, anon;
