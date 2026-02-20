-- ============================================
-- Grant table permissions to anon and authenticated roles
-- RLS policies control row-level access, but the roles
-- also need table-level GRANT permissions.
-- ============================================

-- Anon role: public-facing operations
GRANT SELECT ON appointments TO anon;
GRANT INSERT ON appointments TO anon;
GRANT SELECT ON inventory TO anon;
GRANT SELECT, INSERT ON feedback TO anon;
GRANT SELECT ON patient_links TO anon;
GRANT UPDATE ON patient_links TO anon;
GRANT SELECT ON tokens TO anon;
GRANT UPDATE ON tokens TO anon;
GRANT INSERT ON patients TO anon;

-- Authenticated role: logged-in users (RLS handles row filtering)
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON patients TO authenticated;
GRANT ALL ON appointments TO authenticated;
GRANT ALL ON prescriptions TO authenticated;
GRANT ALL ON inventory TO authenticated;
GRANT ALL ON sales TO authenticated;
GRANT ALL ON queue TO authenticated;
GRANT ALL ON feedback TO authenticated;
GRANT ALL ON tokens TO authenticated;
GRANT ALL ON patient_links TO authenticated;
