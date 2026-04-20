CREATE TABLE IF NOT EXISTS overview (
  sheet_id UUID PRIMARY KEY REFERENCES response_sheets(sheet_id) ON DELETE CASCADE,
  total_respondents INT NOT NULL,
  completed INT NOT NULL,
  partial INT NOT NULL,
  panel_fail INT NOT NULL,
  wave_fail INT NOT NULL,
  outliers_count INT NOT NULL,
  avg_rating NUMERIC(6, 2),
  median_time NUMERIC(8, 2),
  mean_time NUMERIC(8, 2),
  min_time NUMERIC(8, 2),
  max_time NUMERIC(8, 2)
);
