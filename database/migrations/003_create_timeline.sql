CREATE TABLE IF NOT EXISTS timeline (
  id BIGSERIAL PRIMARY KEY,
  sheet_id UUID NOT NULL REFERENCES response_sheets(sheet_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completions_count INT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_timeline_sheet_date ON timeline(sheet_id, date);
