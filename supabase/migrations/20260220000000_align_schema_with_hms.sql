-- ============================================
-- Align pre-existing table schemas with HMS.js
-- Adds columns HMS code expects that are missing
-- from the tables created before the migration
-- ============================================

-- PATIENTS: HMS uses emergency_contact (single), visits, created_by
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS visits INTEGER DEFAULT 0;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- APPOINTMENTS: HMS uses patient_name, patient_phone, queue_position
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_phone TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS queue_position INTEGER;

-- INVENTORY: HMS uses 'stock', existing table has 'quantity'
-- Add stock as alias column; keep quantity for backward compat
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- SALES: HMS uses patient_name, date, time
ALTER TABLE sales ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- FEEDBACK: HMS uses role, page, user_agent, screen_size, resolution_note
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS page TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS screen_size TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS resolution_note TEXT;
-- HMS uses 'name' which already exists in feedback
