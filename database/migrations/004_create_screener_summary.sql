CREATE TABLE IF NOT EXISTS screener_summary (
  sheet_id UUID PRIMARY KEY REFERENCES response_sheets(sheet_id) ON DELETE CASCADE,
  total_screenouts INT NOT NULL,
  panel_screenouts INT NOT NULL,
  wave_screenouts INT NOT NULL,
  primary_screenout_question TEXT,
  primary_screenout_count INT,
  primary_panel_question TEXT,
  primary_panel_count INT,
  primary_wave_question TEXT,
  primary_wave_count INT
);
