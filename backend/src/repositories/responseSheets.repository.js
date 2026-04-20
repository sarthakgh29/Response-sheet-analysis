export async function insertResponseSheet(client, payload) {
  const query = `
    INSERT INTO response_sheets (file_name, uploaded_at, study_type, analysis_version, analysis_json)
    VALUES ($1, NOW(), $2, $3, $4)
    RETURNING sheet_id, sheet_no, file_name, uploaded_at, study_type
  `;

  const values = [
    payload.fileName,
    payload.studyType,
    payload.analysisVersion,
    payload.analysisJson,
  ];

  const result = await client.query(query, values);
  return result.rows[0];
}

export async function getAllResponseSheets(client) {
  const query = `
    SELECT
      rs.sheet_id,
      rs.sheet_no,
      rs.file_name,
      rs.uploaded_at,
      rs.study_type,
      o.total_respondents,
      o.completed
    FROM response_sheets rs
    LEFT JOIN overview o ON o.sheet_id = rs.sheet_id
    ORDER BY rs.sheet_no DESC
  `;

  const result = await client.query(query);
  return result.rows;
}

export async function getResponseSheetById(client, sheetId) {
  const query = `
    SELECT
      sheet_id,
      sheet_no,
      file_name,
      uploaded_at,
      study_type,
      analysis_version,
      analysis_json
    FROM response_sheets
    WHERE sheet_id = $1
  `;

  const result = await client.query(query, [sheetId]);
  return result.rows[0] || null;
}

export async function deleteResponseSheetById(client, sheetId) {
  const query = `
    DELETE FROM response_sheets
    WHERE sheet_id = $1
    RETURNING sheet_id, sheet_no, file_name
  `;

  const result = await client.query(query, [sheetId]);
  return result.rows[0] || null;
}
export async function getResponseSheetByIdOrSheetNo(client, identifier) {
  const raw = String(identifier || '').trim();
  const isNumeric = /^\d+$/.test(raw);

  const query = isNumeric
    ? `
      SELECT
        sheet_id,
        sheet_no,
        file_name,
        uploaded_at,
        study_type,
        analysis_version,
        analysis_json
      FROM response_sheets
      WHERE sheet_no = $1
    `
    : `
      SELECT
        sheet_id,
        sheet_no,
        file_name,
        uploaded_at,
        study_type,
        analysis_version,
        analysis_json
      FROM response_sheets
      WHERE sheet_id = $1
    `;

  const value = isNumeric ? Number(raw) : raw;
  const result = await client.query(query, [value]);
  return result.rows[0] || null;
}