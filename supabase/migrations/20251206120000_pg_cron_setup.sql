-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule the sync-measurements Edge Function to run every 15 minutes
-- Note: Replace YOUR_PROJECT_REF and YOUR_SERVICE_ROLE_KEY with actual values
-- This can be done via Supabase Dashboard > Database > Cron Jobs

-- The cron job will call the Edge Function using pg_net
-- SELECT cron.schedule(
--   'sync-measurements-every-15-min',
--   '*/15 * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-measurements',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
--       'Content-Type', 'application/json'
--     ),
--     body := '{ "name": "Functions" }'::jsonb
--   ) AS request_id;
--   $$
-- );

-- To enable the cron job, run the above SQL in Supabase SQL Editor
-- after replacing YOUR_PROJECT_REF with: tvdzeyuekijfiplimuzm
-- and YOUR_SERVICE_ROLE_KEY with your service role key

-- Example to view scheduled jobs:
-- SELECT * FROM cron.job;

-- Example to unschedule:
-- SELECT cron.unschedule('sync-measurements-every-15-min');
