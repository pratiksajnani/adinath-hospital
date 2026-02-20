-- ============================================
-- Fix: allow anon SELECT on tables where anon can INSERT
-- PostgREST returns the inserted row by default (Prefer: return=representation),
-- which requires SELECT permission in addition to INSERT.
-- ============================================

-- Feedback: anon can insert, so needs to read back
DROP POLICY IF EXISTS "Anon read feedback" ON feedback;
CREATE POLICY "Anon read feedback" ON feedback
  FOR SELECT TO anon
  USING (true);

-- Patients: anon can insert (booking creates patient)
DROP POLICY IF EXISTS "Anon read patients" ON patients;
CREATE POLICY "Anon read patients" ON patients
  FOR SELECT TO anon
  USING (true);

-- Clean up diagnostic functions
DROP FUNCTION IF EXISTS public.check_policies;
DROP FUNCTION IF EXISTS public.check_grants;
