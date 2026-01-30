-- Migration: Enable Row Level Security
-- Description: Enable RLS on all sensitive tables to prevent unauthorized access
-- Date: 2026-01-29
-- CRITICAL SECURITY FIX

-- Enable RLS on all tables
ALTER TABLE contacts_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

-- Note: segments and investor_statuses are reference data, can remain without RLS
-- Note: Adjust these policies based on your authentication setup

-- Example policies for service role (full access)
-- These allow your backend/n8n workflows to access all data
CREATE POLICY "Service role has full access to contacts"
  ON contacts_sync
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to contents"
  ON contents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to distributions"
  ON distributions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to prompts"
  ON prompts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to analytics_events"
  ON analytics_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to workflow_logs"
  ON workflow_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Dashboard users (authenticated) - READ ONLY for now
-- TODO: Customize these policies based on your multi-tenancy/organization setup
-- For now, allowing all authenticated users to read all data
-- You'll need to add organization_id or user_id columns for proper multi-tenancy

CREATE POLICY "Authenticated users can read contacts"
  ON contacts_sync
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read contents"
  ON contents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read distributions"
  ON distributions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read prompts"
  ON prompts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read analytics_events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read workflow_logs"
  ON workflow_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update contents and prompts
-- (required for ContentDetail and PromptDetail edit functionality)
CREATE POLICY "Authenticated users can update contents"
  ON contents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- IMPORTANT: If you have multi-tenancy (multiple organizations/users)
-- You MUST modify these policies to filter by organization_id or user_id
-- Example:
-- USING (organization_id = auth.jwt() ->> 'organization_id')

-- For now, this provides basic security: authenticated users can read/edit,
-- but anon users cannot access anything (except what's explicitly allowed)
