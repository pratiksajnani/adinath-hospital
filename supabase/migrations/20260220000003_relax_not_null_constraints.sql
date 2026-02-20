-- ============================================
-- Relax NOT NULL constraints on pre-existing columns
-- HMS code doesn't always provide these fields
-- ============================================

-- appointments: doctor_name, patient_name are optional in HMS inserts
ALTER TABLE appointments ALTER COLUMN doctor_name DROP NOT NULL;

-- prescriptions: no extra constraints to relax (doctor_id already fixed)

-- inventory: no changes needed

-- sales: total might not always be provided
ALTER TABLE sales ALTER COLUMN total DROP NOT NULL;
