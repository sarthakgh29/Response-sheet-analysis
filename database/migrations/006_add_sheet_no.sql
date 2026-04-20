-- Adds a human-friendly numeric sheet number while keeping UUID as the real PK.
-- Existing rows are backfilled in uploaded_at order starting from 1001.

ALTER TABLE response_sheets
ADD COLUMN IF NOT EXISTS sheet_no BIGINT;

CREATE SEQUENCE IF NOT EXISTS response_sheets_sheet_no_seq START WITH 1001;

ALTER TABLE response_sheets
ALTER COLUMN sheet_no SET DEFAULT nextval('response_sheets_sheet_no_seq');

WITH ordered AS (
  SELECT
    sheet_id,
    ROW_NUMBER() OVER (ORDER BY uploaded_at ASC, file_name ASC, sheet_id ASC) + 1000 AS new_sheet_no
  FROM response_sheets
  WHERE sheet_no IS NULL
)
UPDATE response_sheets rs
SET sheet_no = ordered.new_sheet_no
FROM ordered
WHERE rs.sheet_id = ordered.sheet_id;

SELECT setval(
  'response_sheets_sheet_no_seq',
  COALESCE((SELECT MAX(sheet_no) FROM response_sheets), 1000),
  true
);

ALTER TABLE response_sheets
ALTER COLUMN sheet_no SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_response_sheets_sheet_no_unique
ON response_sheets(sheet_no);
