-- Station Model Configs Table
CREATE TABLE IF NOT EXISTS "public"."station_model_configs" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "station_id" bigint REFERENCES "public"."stations"("id") ON DELETE CASCADE,
    "model_type" text NOT NULL,
    "config" jsonb NOT NULL DEFAULT '{}'::jsonb,
    "updated_at" timestamp with time zone DEFAULT now(),
    UNIQUE("station_id", "model_type")
);
