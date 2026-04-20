-- 007_create_comparison_sets.sql
-- Stores comparisons between two already-uploaded sheets (typically two waves of the same survey)

CREATE SEQUENCE IF NOT EXISTS comparison_sets_comparison_no_seq START WITH 2001;

CREATE TABLE IF NOT EXISTS comparison_sets (
  comparison_set_id UUID PRIMARY KEY,
  comparison_no BIGINT NOT NULL DEFAULT nextval('comparison_sets_comparison_no_seq'),

  sheet_a_id UUID NOT NULL REFERENCES response_sheets(sheet_id) ON DELETE CASCADE,
  sheet_b_id UUID NOT NULL REFERENCES response_sheets(sheet_id) ON DELETE CASCADE,

  sheet_a_no BIGINT,
  sheet_b_no BIGINT,

  survey_name TEXT,
  wave_a_label TEXT,
  wave_b_label TEXT,
  study_type TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  comparison_json JSONB NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_comparison_sets_comparison_no_unique
ON comparison_sets(comparison_no);

CREATE INDEX IF NOT EXISTS idx_comparison_sets_sheet_a_id
ON comparison_sets(sheet_a_id);

CREATE INDEX IF NOT EXISTS idx_comparison_sets_sheet_b_id
ON comparison_sets(sheet_b_id);