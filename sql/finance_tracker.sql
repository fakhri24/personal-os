-- =============================================
-- FINANCE TRACKER — Table Creation + Grants
-- Run this in Supabase SQL Editor
-- =============================================

-- Create table
CREATE TABLE IF NOT EXISTS finance_tracker (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
    category TEXT
);

-- RLS
ALTER TABLE finance_tracker ENABLE ROW LEVEL SECURITY;

-- Full access for service_role (backend)
GRANT ALL ON finance_tracker TO service_role;

-- CRUD for anon (frontend)
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_tracker TO anon;

-- RLS policy: anon can do everything on this table
CREATE POLICY "Allow all on finance_tracker" ON finance_tracker
    FOR ALL USING (true) WITH CHECK (true);
