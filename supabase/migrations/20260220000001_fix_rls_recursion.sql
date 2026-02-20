-- ============================================
-- Fix RLS infinite recursion
-- Old policies used: EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid())
-- This causes recursion because `users` table has its own RLS.
-- Drop old policies, keep new ones that use get_user_role().
-- ============================================

-- Drop old policies on patients
DROP POLICY IF EXISTS "Staff can view patients" ON patients;
DROP POLICY IF EXISTS "Patients can view own record" ON patients;
DROP POLICY IF EXISTS "Anyone can insert patients" ON patients;

-- Drop old policies on appointments
DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can insert appointments" ON appointments;

-- Drop old policies on prescriptions
DROP POLICY IF EXISTS "Doctors can manage prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Staff can view prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Patients can view own prescriptions" ON prescriptions;

-- Drop old policies on inventory
DROP POLICY IF EXISTS "Staff can manage inventory" ON inventory;
DROP POLICY IF EXISTS "Anyone can view inventory" ON inventory;

-- Drop old policies on sales
DROP POLICY IF EXISTS "Staff can manage sales" ON sales;

-- Drop old policies on feedback
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
DROP POLICY IF EXISTS "Staff can view feedback" ON feedback;
DROP POLICY IF EXISTS "Admin can manage feedback" ON feedback;

-- Drop old policies on users table (the source of recursion)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Staff can view users" ON users;

-- Disable RLS on the old users table to prevent any remaining recursion
-- (we use profiles table now, users table is legacy)
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
