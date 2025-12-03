-- Fix RLS policy for measurements table to allow INSERT operations for admins

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow admin insert/update/delete" ON "public"."measurements";

-- Create separate policies for different operations
-- This policy allows admins to SELECT measurements
CREATE POLICY "Allow admin select" ON "public"."measurements" FOR
SELECT USING (
        "public"."authorize" (
            'data.manage'::"public"."app_permission", "auth"."uid" ()
        )
    );

-- This policy allows admins to INSERT measurements
CREATE POLICY "Allow admin insert" ON "public"."measurements" FOR INSERT
WITH
    CHECK (
        "public"."authorize" (
            'data.manage'::"public"."app_permission",
            "auth"."uid" ()
        )
    );

-- This policy allows admins to UPDATE measurements
CREATE POLICY "Allow admin update" ON "public"."measurements"
FOR UPDATE
    USING (
        "public"."authorize" (
            'data.manage'::"public"."app_permission",
            "auth"."uid" ()
        )
    )
WITH
    CHECK (
        "public"."authorize" (
            'data.manage'::"public"."app_permission",
            "auth"."uid" ()
        )
    );

-- This policy allows admins to DELETE measurements
CREATE POLICY "Allow admin delete" ON "public"."measurements" FOR DELETE USING (
    "public"."authorize" (
        'data.manage'::"public"."app_permission",
        "auth"."uid" ()
    )
);