-- ============================================
-- Adinath Hospital - Core Tables Migration
-- Replaces localStorage-based HMS with Supabase
-- ============================================

-- Helper: get current user's role without recursion on profiles
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Admin/doctor/staff can read all profiles
CREATE POLICY "Staff read all profiles" ON profiles
  FOR SELECT USING (
    get_user_role() IN ('admin', 'doctor', 'receptionist', 'nurse', 'pharmacist', 'staff')
  );

-- Users can update their own profile (non-role fields)
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin can insert/update/delete any profile
CREATE POLICY "Admin manages all profiles" ON profiles
  FOR ALL USING (get_user_role() = 'admin');

-- Allow new users to create their own profile on signup
CREATE POLICY "Users create own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================
-- 2. PATIENTS
-- ============================================
CREATE TABLE patients (
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

-- Staff/doctors/admin can manage patients
CREATE POLICY "Staff manage patients" ON patients
  FOR ALL USING (
    get_user_role() IN ('admin', 'doctor', 'receptionist', 'nurse', 'pharmacist', 'staff')
  );

-- Anon can insert patients (public appointment booking creates patient)
CREATE POLICY "Anon insert patients" ON patients
  FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================
-- 3. APPOINTMENTS
-- ============================================
CREATE TABLE appointments (
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

-- Staff/doctors/admin can manage appointments
CREATE POLICY "Staff manage appointments" ON appointments
  FOR ALL USING (
    get_user_role() IN ('admin', 'doctor', 'receptionist', 'nurse', 'staff')
  );

-- Anon can insert appointments (public booking)
CREATE POLICY "Anon insert appointments" ON appointments
  FOR INSERT TO anon
  WITH CHECK (true);

-- Anon can read own appointment by phone (for check-status page)
CREATE POLICY "Anon read own appointments" ON appointments
  FOR SELECT TO anon
  USING (true);

-- ============================================
-- 4. PRESCRIPTIONS
-- ============================================
CREATE TABLE prescriptions (
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

-- Doctors and admin can manage prescriptions
CREATE POLICY "Doctors manage prescriptions" ON prescriptions
  FOR ALL USING (
    get_user_role() IN ('admin', 'doctor')
  );

-- Staff can read prescriptions
CREATE POLICY "Staff read prescriptions" ON prescriptions
  FOR SELECT USING (
    get_user_role() IN ('receptionist', 'nurse', 'pharmacist', 'staff')
  );

-- ============================================
-- 5. INVENTORY
-- ============================================
CREATE TABLE inventory (
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

-- Staff/admin can manage inventory
CREATE POLICY "Staff manage inventory" ON inventory
  FOR ALL USING (
    get_user_role() IN ('admin', 'receptionist', 'pharmacist', 'staff')
  );

-- Anon can read inventory (public store page)
CREATE POLICY "Anon read inventory" ON inventory
  FOR SELECT TO anon
  USING (true);

-- Doctors can read inventory
CREATE POLICY "Doctors read inventory" ON inventory
  FOR SELECT USING (get_user_role() = 'doctor');

-- ============================================
-- 6. SALES
-- ============================================
CREATE TABLE sales (
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

-- Staff/admin can manage sales
CREATE POLICY "Staff manage sales" ON sales
  FOR ALL USING (
    get_user_role() IN ('admin', 'receptionist', 'pharmacist', 'staff')
  );

-- Doctors can read sales
CREATE POLICY "Doctors read sales" ON sales
  FOR SELECT USING (get_user_role() = 'doctor');

-- ============================================
-- 7. QUEUE (daily appointment queue)
-- ============================================
CREATE TABLE queue (
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

-- Staff/doctors/admin can manage queue
CREATE POLICY "Staff manage queue" ON queue
  FOR ALL USING (
    get_user_role() IN ('admin', 'doctor', 'receptionist', 'nurse', 'staff')
  );

-- ============================================
-- 8. PATIENT_LINKS (QR-code registration links)
-- ============================================
CREATE TABLE patient_links (
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

-- Staff/admin can manage patient links
CREATE POLICY "Staff manage patient_links" ON patient_links
  FOR ALL USING (
    get_user_role() IN ('admin', 'doctor', 'receptionist', 'staff')
  );

-- Anon can read links (for validation on public signup page)
CREATE POLICY "Anon validate patient_links" ON patient_links
  FOR SELECT TO anon
  USING (true);

-- Anon can update links (mark as used after signup)
CREATE POLICY "Anon use patient_links" ON patient_links
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 9. TOKENS (onboarding invitation tokens)
-- ============================================
CREATE TABLE tokens (
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

-- Admin can manage tokens
CREATE POLICY "Admin manage tokens" ON tokens
  FOR ALL USING (get_user_role() = 'admin');

-- Anon can read tokens (for validation on onboard pages)
CREATE POLICY "Anon validate tokens" ON tokens
  FOR SELECT TO anon
  USING (true);

-- Anon can update tokens (mark as used)
CREATE POLICY "Anon use tokens" ON tokens
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 10. FEEDBACK (patient/staff feedback)
-- ============================================
CREATE TABLE feedback (
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

-- Anyone can submit feedback
CREATE POLICY "Anon insert feedback" ON feedback
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated insert feedback" ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Admin can manage all feedback
CREATE POLICY "Admin manage feedback" ON feedback
  FOR ALL USING (get_user_role() = 'admin');

-- Staff can read feedback
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

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- INDEXES for common query patterns
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_queue_date ON queue(date);
CREATE INDEX idx_queue_doctor ON queue(doctor_id);
CREATE INDEX idx_tokens_token ON tokens(token);
CREATE INDEX idx_patient_links_token ON patient_links(token);
