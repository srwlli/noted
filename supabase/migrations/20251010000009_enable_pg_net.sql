-- Enable pg_net extension for HTTP requests in triggers
-- This is required for the agent chat trigger to call the Edge Function

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to authenticated users and service role
GRANT USAGE ON SCHEMA net TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO authenticated, service_role;

-- Add comment
COMMENT ON EXTENSION pg_net IS 'Enable HTTP requests from PostgreSQL functions (used by agent chat trigger)';
