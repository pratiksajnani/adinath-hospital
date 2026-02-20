-- ============================================
-- Ensure feedback RLS policies exist
-- May have been lost in earlier migration rollbacks
-- ============================================

-- Re-enable RLS (idempotent)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop and recreate all feedback policies
DROP POLICY IF EXISTS "Anon insert feedback" ON feedback;
CREATE POLICY "Anon insert feedback" ON feedback
  FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated insert feedback" ON feedback;
CREATE POLICY "Authenticated insert feedback" ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage feedback" ON feedback;
CREATE POLICY "Admin manage feedback" ON feedback
  FOR ALL USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Staff read feedback" ON feedback;
CREATE POLICY "Staff read feedback" ON feedback
  FOR SELECT USING (
    get_user_role() IN ('doctor', 'receptionist', 'staff')
  );

-- Also ensure all other table policies exist (idempotent recreation)
-- Patients
DROP POLICY IF EXISTS "Staff manage patients" ON patients;
CREATE POLICY "Staff manage patients" ON patients
  FOR ALL USING (
    get_user_role() IN ('admin', 'doctor', 'receptionist', 'nurse', 'pharmacist', 'staff')
  );

DROP POLICY IF EXISTS "Anon insert patients" ON patients;
CREATE POLICY "Anon insert patients" ON patients
  FOR INSERT TO anon
  WITH CHECK (true);

-- Appointments
DROP POLICY IF EXISTS "Staff manage appointments" ON appointments;
CREATE POLICY "Staff manage appointments" ON appointments
  FOR ALL USING (
    get_user_role() IN ('admin', 'doctor', 'receptionist', 'nurse', 'staff')
  );

DROP POLICY IF EXISTS "Anon insert appointments" ON appointments;
CREATE POLICY "Anon insert appointments" ON appointments
  FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon read own appointments" ON appointments;
CREATE POLICY "Anon read own appointments" ON appointments
  FOR SELECT TO anon
  USING (true);

-- Prescriptions
DROP POLICY IF EXISTS "Doctors manage prescriptions" ON prescriptions;
CREATE POLICY "Doctors manage prescriptions" ON prescriptions
  FOR ALL USING (
    get_user_role() IN ('admin', 'doctor')
  );

DROP POLICY IF EXISTS "Staff read prescriptions" ON prescriptions;
CREATE POLICY "Staff read prescriptions" ON prescriptions
  FOR SELECT USING (
    get_user_role() IN ('receptionist', 'nurse', 'pharmacist', 'staff')
  );

-- Inventory
DROP POLICY IF EXISTS "Staff manage inventory" ON inventory;
CREATE POLICY "Staff manage inventory" ON inventory
  FOR ALL USING (
    get_user_role() IN ('admin', 'receptionist', 'pharmacist', 'staff')
  );

DROP POLICY IF EXISTS "Anon read inventory" ON inventory;
CREATE POLICY "Anon read inventory" ON inventory
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Doctors read inventory" ON inventory;
CREATE POLICY "Doctors read inventory" ON inventory
  FOR SELECT USING (get_user_role() = 'doctor');

-- Sales
DROP POLICY IF EXISTS "Staff manage sales" ON sales;
CREATE POLICY "Staff manage sales" ON sales
  FOR ALL USING (
    get_user_role() IN ('admin', 'receptionist', 'pharmacist', 'staff')
  );

DROP POLICY IF EXISTS "Doctors read sales" ON sales;
CREATE POLICY "Doctors read sales" ON sales
  FOR SELECT USING (get_user_role() = 'doctor');
