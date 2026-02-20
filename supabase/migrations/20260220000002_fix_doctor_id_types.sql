-- ============================================
-- Fix doctor_id column types
-- Pre-existing tables had doctor_id as UUID FK to users(id).
-- HMS code sends text identifiers. Drop old FK and change to TEXT.
-- ============================================

-- appointments.doctor_id: UUID -> TEXT
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;
ALTER TABLE appointments ALTER COLUMN doctor_id TYPE TEXT USING doctor_id::TEXT;

-- prescriptions.doctor_id: UUID -> TEXT
ALTER TABLE prescriptions DROP CONSTRAINT IF EXISTS prescriptions_doctor_id_fkey;
ALTER TABLE prescriptions ALTER COLUMN doctor_id TYPE TEXT USING doctor_id::TEXT;
