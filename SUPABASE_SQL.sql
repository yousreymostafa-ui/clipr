-- ============================================
-- CLiPR v3 — Full Database Setup
-- Run this entire block in Supabase SQL Editor
-- ============================================

-- Drop old table if exists and recreate fresh
DROP TABLE IF EXISTS clips CASCADE;

CREATE TABLE clips (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,

  -- Content
  type text NOT NULL DEFAULT 'text', -- 'link' | 'text' | 'image' | 'file'
  raw_input text,
  url text,
  title text,
  description text,
  image_url text,
  site_name text,
  note text,

  -- File uploads
  file_url text,
  file_name text,
  file_type text,

  -- Organization
  category text DEFAULT 'General',
  tags text[] DEFAULT '{}',

  -- Status
  device text DEFAULT 'desktop',
  archived boolean DEFAULT false,
  favorited boolean DEFAULT false,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Security
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own clips"
ON clips FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE clips;

-- Storage bucket for file/image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('clip-uploads', 'clip-uploads', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Users upload own files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clip-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read clip uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'clip-uploads');

CREATE POLICY "Users delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'clip-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
