-- Migration: Distribution Aggregation Functions
-- Description: Server-side aggregation for chart data to avoid 1000-row limit
-- Date: 2026-01-29

-- Function to get distribution counts by channel
CREATE OR REPLACE FUNCTION get_distributions_by_channel(
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL,
  p_channel TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  channel TEXT,
  sent_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.channel::TEXT,
    COUNT(*)::BIGINT as sent_count
  FROM distributions d
  WHERE
    (p_start_date IS NULL OR d.sent_at >= p_start_date) AND
    (p_end_date IS NULL OR d.sent_at <= p_end_date) AND
    (p_channel IS NULL OR d.channel = p_channel) AND
    (p_status IS NULL OR d.status = p_status)
  GROUP BY d.channel
  ORDER BY sent_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_distributions_by_channel TO authenticated, anon;

-- Note: For PerformanceChart, use the existing v_distribution_performance view
-- which already has aggregated metrics
