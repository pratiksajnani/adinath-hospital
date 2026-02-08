-- Design Feedback table for the design review loop
-- Doctors submit feedback on mockup designs, which becomes Linear issues

CREATE TABLE design_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  sentiment TEXT NOT NULL,
  feedback TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  linear_issue_id TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE design_feedback ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (doctors/admin) to insert
CREATE POLICY "Authenticated users can insert feedback"
  ON design_feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to read all feedback
CREATE POLICY "Authenticated users can read feedback"
  ON design_feedback FOR SELECT
  TO authenticated
  USING (true);

-- Allow anon for demo mode (localStorage auth)
CREATE POLICY "Anon can insert feedback"
  ON design_feedback FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can read feedback"
  ON design_feedback FOR SELECT
  TO anon
  USING (true);
