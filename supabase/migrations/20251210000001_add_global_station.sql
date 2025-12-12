-- Create a special "global" station entry for unified models
-- This allows us to save unified model performance to the database

-- Insert global station (ID=0) if it doesn't exist
INSERT INTO "public"."stations" (
    "id",
    "station_code",
    "name",
    "latitude",
    "longitude",
    "country"
)
VALUES (
    0,
    'GLOBAL',
    'Global Model (All Stations)',
    0.0,
    0.0,
    'GLOBAL'
)
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE "public"."stations" IS 'Water level monitoring stations. ID=0 represents unified model across all stations.';
