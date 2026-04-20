CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS response_sheets (
  sheet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  study_type TEXT,
  analysis_version TEXT NOT NULL DEFAULT 'v1',
  analysis_json JSONB NOT NULL
);
