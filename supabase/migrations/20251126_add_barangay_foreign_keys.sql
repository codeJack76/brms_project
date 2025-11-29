-- Migration: Add foreign key constraint for barangay_id in clearances table
-- This migration adds a proper foreign key relationship between clearances and barangays tables

-- First, ensure we have the barangays table (it should exist from 001_complete_database_setup.sql)
-- The barangay_id column already exists in clearances table, we just need to add the FK constraint

-- Add foreign key constraint for barangay_id referencing barangays table
-- Using ON DELETE RESTRICT to prevent deleting a barangay that has clearance records
ALTER TABLE public.clearances
    DROP CONSTRAINT IF EXISTS fk_clearances_barangay;

ALTER TABLE public.clearances
    ADD CONSTRAINT fk_clearances_barangay
    FOREIGN KEY (barangay_id)
    REFERENCES public.barangays(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- Add comment for documentation
COMMENT ON CONSTRAINT fk_clearances_barangay ON public.clearances IS 'Links clearance to the barangay that issued it';

-- Also add foreign key constraint for blotter table barangay_id if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blotter') THEN
        ALTER TABLE public.blotter
            DROP CONSTRAINT IF EXISTS fk_blotter_barangay;
            
        ALTER TABLE public.blotter
            ADD CONSTRAINT fk_blotter_barangay
            FOREIGN KEY (barangay_id)
            REFERENCES public.barangays(id)
            ON DELETE RESTRICT
            ON UPDATE CASCADE;
            
        COMMENT ON CONSTRAINT fk_blotter_barangay ON public.blotter IS 'Links blotter record to the barangay where it was filed';
    END IF;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR MULTI-TENANT DATA ISOLATION
-- These policies ensure that users can only access data from their own barangay
-- ============================================================================

-- Enable RLS on clearances table (if not already enabled)
ALTER TABLE public.clearances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their barangay clearances" ON public.clearances;
DROP POLICY IF EXISTS "Users can insert clearances for their barangay" ON public.clearances;
DROP POLICY IF EXISTS "Users can update their barangay clearances" ON public.clearances;
DROP POLICY IF EXISTS "Users can delete their barangay clearances" ON public.clearances;

-- Create RLS policies for clearances
-- Note: These work with the service role key bypassing RLS, but provide extra security layer
CREATE POLICY "Users can view their barangay clearances"
    ON public.clearances
    FOR SELECT
    USING (
        barangay_id IN (
            SELECT barangay_id FROM public.users 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND role = 'superadmin'
        )
    );

CREATE POLICY "Users can insert clearances for their barangay"
    ON public.clearances
    FOR INSERT
    WITH CHECK (
        barangay_id IN (
            SELECT barangay_id FROM public.users 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

CREATE POLICY "Users can update their barangay clearances"
    ON public.clearances
    FOR UPDATE
    USING (
        barangay_id IN (
            SELECT barangay_id FROM public.users 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND role = 'superadmin'
        )
    );

CREATE POLICY "Users can delete their barangay clearances"
    ON public.clearances
    FOR DELETE
    USING (
        barangay_id IN (
            SELECT barangay_id FROM public.users 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND role = 'superadmin'
        )
    );

-- Enable RLS on blotter table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blotter') THEN
        ALTER TABLE public.blotter ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view their barangay blotter" ON public.blotter;
        DROP POLICY IF EXISTS "Users can insert blotter for their barangay" ON public.blotter;
        DROP POLICY IF EXISTS "Users can update their barangay blotter" ON public.blotter;
        DROP POLICY IF EXISTS "Users can delete their barangay blotter" ON public.blotter;
        
        -- Create RLS policies for blotter
        CREATE POLICY "Users can view their barangay blotter"
            ON public.blotter
            FOR SELECT
            USING (
                barangay_id IN (
                    SELECT barangay_id FROM public.users 
                    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
                )
                OR EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
                    AND role = 'superadmin'
                )
            );

        CREATE POLICY "Users can insert blotter for their barangay"
            ON public.blotter
            FOR INSERT
            WITH CHECK (
                barangay_id IN (
                    SELECT barangay_id FROM public.users 
                    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
                )
            );

        CREATE POLICY "Users can update their barangay blotter"
            ON public.blotter
            FOR UPDATE
            USING (
                barangay_id IN (
                    SELECT barangay_id FROM public.users 
                    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
                )
                OR EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
                    AND role = 'superadmin'
                )
            );

        CREATE POLICY "Users can delete their barangay blotter"
            ON public.blotter
            FOR DELETE
            USING (
                barangay_id IN (
                    SELECT barangay_id FROM public.users 
                    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
                )
                OR EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
                    AND role = 'superadmin'
                )
            );
    END IF;
END $$;
