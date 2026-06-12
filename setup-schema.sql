-- =============================================
-- PERSONAL OS — Supabase Schema Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Ideas Brainstorm
CREATE TABLE IF NOT EXISTS ideas_brainstorm (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'Active'
);

-- 2. Clothes Tracker
CREATE TABLE IF NOT EXISTS clothes_tracker (
    id BIGSERIAL PRIMARY KEY,
    clothing_name TEXT NOT NULL,
    status TEXT DEFAULT 'Bersih' CHECK (status IN ('Bersih', 'Dipakai', 'Di Keranjang Cuci', 'Sedang Dijemur')),
    last_worn DATE,
    last_washed DATE
);

-- 3. Learning Reminders
CREATE TABLE IF NOT EXISTS learning_reminders (
    id BIGSERIAL PRIMARY KEY,
    topic_name TEXT NOT NULL,
    last_reviewed DATE,
    interval_days INTEGER DEFAULT 1,
    next_review DATE
);

-- 4. Package Tracker
CREATE TABLE IF NOT EXISTS package_tracker (
    id BIGSERIAL PRIMARY KEY,
    courier TEXT NOT NULL,
    receipt_number TEXT NOT NULL,
    package_name TEXT,
    last_status TEXT DEFAULT 'Not checked yet',
    last_checked TIMESTAMPTZ
);

-- 5. Local Files Index
CREATE TABLE IF NOT EXISTS local_files_index (
    id BIGSERIAL PRIMARY KEY,
    original_name TEXT NOT NULL,
    new_name TEXT,
    file_path TEXT,
    category TEXT,
    indexed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) — allow all for anon (personal use)
ALTER TABLE ideas_brainstorm ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_files_index ENABLE ROW LEVEL SECURITY;

-- Create policies that allow full access for anon key (personal project)
CREATE POLICY "Allow all access" ON ideas_brainstorm FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON clothes_tracker FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON learning_reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON package_tracker FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON local_files_index FOR ALL USING (true) WITH CHECK (true);
