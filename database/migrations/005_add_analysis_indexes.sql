CREATE INDEX IF NOT EXISTS idx_response_sheets_uploaded_at ON response_sheets(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_response_sheets_study_type ON response_sheets(study_type);
CREATE INDEX IF NOT EXISTS idx_response_sheets_analysis_json_gin ON response_sheets USING GIN (analysis_json);
