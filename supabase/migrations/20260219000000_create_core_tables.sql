-- ============================================
-- Adinath Hospital - Core Tables Migration
-- Replaces localStorage-based HMS with Supabase
-- Idempotent: safe to re-run against existing tables
-- ============================================

-- ============================================
-- 1. PROFILES (extends auth.users)
-- Must be created BEFORE get_user_role() since
-- SQL-language functions validate at creation time
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_gu TEXT,
  name_hi TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'patient'
    CHECK (role IN ('admin', 'doctor', 'receptionist', 'nurse', 'pharmacist', 'staff', 'patient')),
  photo_url TEXT,
  department TEXT,
  specialty TEXT,
  specialty_gu TEXT,
  specialty_hi TEXT,
  permissions TEXT[] DEFAULT '{}',
  preferred_language TEXT DEFAULT 'en'
    CHECK (preferred_language IN ('en', 'hi', 'gu')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper: get current user's role (used by RLS policies on all tables)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Staff read all profiles" ON profiles;
CREATE POLICY "Staff read all profiles" ON profiles
  FOR SELECT USING (
    get_user_role() IN ('admin', 'doctor', 'receptionist', 'nurse', 'pharmacist', 'staff')
  );

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admin manages all profiles" ON profiles;
CREATE POLICY "Admin manages all profiles" ON profiles
  FOR ALL USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Users create own profile" ON profiles;
CREATE POLICY "Users create own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================
-- 2. PATIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  blood_group TEXT,
  medical_history TEXT,
  allergies TEXT,
  emergency_contact TEXT,
  preferred_language TEXT DEFAULT 'hi'
    CHECK (preferred_language IN ('en', 'hi', 'gu')),
  visits INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage patients" ON patients;
CREATE POLICY "Staff manage patients" ON patients
  FOR ALL USING (
    get_user_role() IN ('admin', 'doctor', 'receptionist', 'nurse', 'pharmacist', 'staff')
  );

DROP POLICY IF EXISTS "Anon insert patients" ON patients;
CREATE POLICY "Anon insert patients" ON patients
  FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================
-- 3. APPOINTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  doctor_id TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'waiting', 'in_progress', 'completed', 'cancelled')),
  queue_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- 4. PRESCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  doctor_id TEXT NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  diagnosis TEXT,
  medicines JSONB DEFAULT '[]',
  advice TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- 5. INVENTORY
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  stock INTEGER DEFAULT 0,
  unit TEXT,
  price DECIMAL(10,2),
  expiry_date DATE,
  reorder_level INTEGER DEFAULT 10,
  supplier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- 6. SALES
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT,
  items JSONB DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  date DATE DEFAULT CURRENT_DATE,
  time TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage sales" ON sales;
CREATE POLICY "Staff manage sales" ON sales
  FOR ALL USING (
    get_user_role() IN ('admin', 'receptionist', 'pharmacist', 'staff')
  );

DROP POLICY IF EXISTS "Doctors read sales" ON sales;
CREATE POLICY "Doctors read sales" ON sales
  FOR SELECT USING (get_user_role() = 'doctor');

-- ============================================
-- 7. QUEUE (daily appointment queue)
-- ============================================
CREATE TABLE IF NOT EXISTS queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  doctor_id TEXT NOT NULL,
  queue_number INTEGER NOT NULL,
  status TEXT DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'in_progress', 'completed', 'skipped')),
  date DATE DEFAULT CURRENT_DATE,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage queue" ON queue;
CREATE POLICY "Staff manage queue" ON queue
  FOR ALL USING (
    get_user_role() IN ('admin', 'doctor', 'receptionist', 'nurse', 'staff')
  );

-- ============================================
-- 8. PATIENT_LINKS (QR-code registration links)
-- ============================================
CREATE TABLE IF NOT EXISTS patient_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  patient_phone TEXT,
  patient_name TEXT,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage patient_links" ON patient_links;
CREATE POLICY "Staff manage patient_links" ON patient_links
  FOR ALL USING (
    get_user_role() IN ('admin', 'doctor', 'receptionist', 'staff')
  );

DROP POLICY IF EXISTS "Anon validate patient_links" ON patient_links;
CREATE POLICY "Anon validate patient_links" ON patient_links
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon use patient_links" ON patient_links;
CREATE POLICY "Anon use patient_links" ON patient_links
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 9. TOKENS (onboarding invitation tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  target_email TEXT,
  target_role TEXT NOT NULL
    CHECK (target_role IN ('admin', 'doctor', 'receptionist', 'nurse', 'pharmacist', 'staff', 'patient')),
  purpose TEXT DEFAULT 'registration',
  created_by TEXT DEFAULT 'system',
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage tokens" ON tokens;
CREATE POLICY "Admin manage tokens" ON tokens
  FOR ALL USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Anon validate tokens" ON tokens;
CREATE POLICY "Anon validate tokens" ON tokens
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon use tokens" ON tokens;
CREATE POLICY "Anon use tokens" ON tokens
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 10. FEEDBACK (patient/staff feedback)
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT,
  page TEXT,
  type TEXT CHECK (type IN ('bug', 'feature', 'question', 'other')),
  priority TEXT DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  name TEXT DEFAULT 'Anonymous',
  user_agent TEXT,
  screen_size TEXT,
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- AUTO-UPDATE timestamps trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS patients_updated_at ON patients;
CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS appointments_updated_at ON appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS inventory_updated_at ON inventory;
CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS feedback_updated_at ON feedback;
CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- INDEXES for common query patterns
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_queue_date ON queue(date);
CREATE INDEX IF NOT EXISTS idx_queue_doctor ON queue(doctor_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
CREATE INDEX IF NOT EXISTS idx_patient_links_token ON patient_links(token);
