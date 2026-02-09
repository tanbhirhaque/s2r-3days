-- ============================================
-- GOOGLE ADS WORKSHOP - SUPABASE DATABASE SCHEMA
-- ============================================
-- This file contains the complete database setup for the enrollment system
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. CREATE ENROLLMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Required Fields
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    
    -- Enrollment Package
    enrollment_package TEXT NOT NULL,
    package_price INTEGER NOT NULL,
    
    -- Payment Information
    payment_method TEXT,
    payer_bkash_number TEXT,
    payment_transaction_id TEXT,
    payment_submitted_at TIMESTAMPTZ,
    
    -- Tracking
    source_page TEXT,
    user_agent TEXT,
    
    -- Status Management
    status TEXT NOT NULL DEFAULT 'payment_pending',
    
    -- Constraints
    CONSTRAINT valid_package CHECK (enrollment_package IN ('3_days_workshop', '3_days_with_support')),
    CONSTRAINT valid_price CHECK (package_price IN (1500, 2000)),
    CONSTRAINT valid_status CHECK (status IN ('payment_pending', 'payment_submitted', 'verified', 'enrolled', 'rejected'))
);

-- ============================================
-- 2. CREATE UNIQUE CONSTRAINT (prevent duplicates)
-- ============================================
-- Prevent the same email from enrolling multiple times
CREATE UNIQUE INDEX IF NOT EXISTS unique_email_enrollment 
ON public.enrollments (LOWER(email));

-- Prevent duplicate transaction IDs (only when not null)
CREATE UNIQUE INDEX IF NOT EXISTS unique_transaction_id 
ON public.enrollments (payment_transaction_id) 
WHERE payment_transaction_id IS NOT NULL;

-- ============================================
-- 3. CREATE INDEXES (for performance)
-- ============================================
-- Index for sorting by creation date (most recent first)
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at 
ON public.enrollments (created_at DESC);

-- Index for filtering by email (for lookups)
CREATE INDEX IF NOT EXISTS idx_enrollments_email 
ON public.enrollments (email);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_enrollments_status 
ON public.enrollments (status);

-- Index for searching by transaction ID
CREATE INDEX IF NOT EXISTS idx_enrollments_transaction_id 
ON public.enrollments (payment_transaction_id);


-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- Policy 1: Allow anonymous users to INSERT (submit the form)
CREATE POLICY "Allow public insert" 
ON public.enrollments 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Deny SELECT for anonymous users (they cannot read data)
-- Only authenticated users with proper permissions can read
CREATE POLICY "Deny public select" 
ON public.enrollments 
FOR SELECT 
TO anon
USING (false);

-- Policy 3: Allow authenticated users to SELECT (for admin dashboard)
-- You can make this more restrictive by checking user roles
CREATE POLICY "Allow authenticated select" 
ON public.enrollments 
FOR SELECT 
TO authenticated
USING (true);

-- Policy 4: Deny UPDATE for anonymous users
CREATE POLICY "Deny public update" 
ON public.enrollments 
FOR UPDATE 
TO anon
USING (false);

-- Policy 5: Deny DELETE for anonymous users
CREATE POLICY "Deny public delete" 
ON public.enrollments 
FOR DELETE 
TO anon
USING (false);

-- ============================================
-- 6. CREATE UPDATED_AT TRIGGER (optional but recommended)
-- ============================================
-- Add updated_at column to track when records are modified
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.enrollments;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================
-- Grant INSERT permission to anon role (for form submissions)
GRANT INSERT ON public.enrollments TO anon;
GRANT INSERT ON public.enrollments TO authenticated;

-- Grant SELECT permission to authenticated users only
GRANT SELECT ON public.enrollments TO authenticated;

-- ============================================
-- 8. CREATE A VIEW FOR ADMIN DASHBOARD (optional)
-- ============================================
-- This view shows only the essential fields for admin review
CREATE OR REPLACE VIEW public.enrollments_summary AS
SELECT 
    id,
    created_at,
    full_name,
    email,
    whatsapp_number,
    enrollment_package,
    package_price,
    payment_method,
    payment_transaction_id,
    payment_submitted_at,
    status
FROM public.enrollments
ORDER BY created_at DESC;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.enrollments_summary TO authenticated;


-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Copy your Supabase Project URL and anon key
-- 2. Paste them into app.js (SUPABASE_URL and SUPABASE_ANON_KEY)
-- 3. Test the form submission
-- 4. Access data using the service_role key (server-side only) or Supabase Dashboard

-- ============================================
-- TESTING QUERIES (run these to verify setup)
-- ============================================

-- Check if table exists and has correct structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'enrollments';

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'enrollments';

-- Check policies
-- SELECT * FROM pg_policies WHERE tablename = 'enrollments';

-- Test insert (should work)
-- INSERT INTO public.enrollments (full_name, email, whatsapp_number, payment_transaction_id)
-- VALUES ('Test User', 'test@example.com', '+1234567890', 'TXN123456789');


-- Test select as anon (should fail due to RLS)
-- This will only work if you're authenticated
-- SELECT * FROM public.enrollments;

