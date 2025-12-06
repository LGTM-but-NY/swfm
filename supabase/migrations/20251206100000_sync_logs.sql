-- Create sync_logs table for tracking data synchronization history
CREATE TABLE IF NOT EXISTS "public"."sync_logs" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "synced_at" timestamp with time zone DEFAULT now() NOT NULL,
    "success_count" integer DEFAULT 0,
    "error_count" integer DEFAULT 0,
    "details" jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE "public"."sync_logs" ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read sync logs (public dashboard can show last sync time)
CREATE POLICY "Allow public read" ON "public"."sync_logs" 
  FOR SELECT USING (true);

-- Service role can insert (for Edge Functions)
CREATE POLICY "Allow service role insert" ON "public"."sync_logs" 
  FOR INSERT WITH CHECK (true);

-- Create index for faster queries on synced_at
CREATE INDEX IF NOT EXISTS "idx_sync_logs_synced_at" 
  ON "public"."sync_logs" ("synced_at" DESC);
