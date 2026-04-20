export async function insertComparisonSet(client, payload) {
  const query = `
    INSERT INTO comparison_sets (
      comparison_set_id,
      sheet_a_id,
      sheet_b_id,
      sheet_a_no,
      sheet_b_no,
      survey_name,
      wave_a_label,
      wave_b_label,
      study_type,
      comparison_json
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING
      comparison_set_id,
      comparison_no,
      sheet_a_id,
      sheet_b_id,
      sheet_a_no,
      sheet_b_no,
      survey_name,
      wave_a_label,
      wave_b_label,
      study_type,
      created_at
  `;

  const values = [
    payload.comparisonSetId,
    payload.sheetAId,
    payload.sheetBId,
    payload.sheetANo,
    payload.sheetBNo,
    payload.surveyName,
    payload.waveALabel,
    payload.waveBLabel,
    payload.studyType,
    payload.comparisonJson,
  ];

  const result = await client.query(query, values);
  return result.rows[0];
}

export async function getComparisonSetById(client, comparisonSetId) {
  const query = `
    SELECT
      comparison_set_id,
      comparison_no,
      sheet_a_id,
      sheet_b_id,
      sheet_a_no,
      sheet_b_no,
      survey_name,
      wave_a_label,
      wave_b_label,
      study_type,
      created_at,
      comparison_json
    FROM comparison_sets
    WHERE comparison_set_id = $1
  `;

  const result = await client.query(query, [comparisonSetId]);
  return result.rows[0] || null;
}

export async function getAllComparisonSets(client) {
  const query = `
    SELECT
      comparison_set_id,
      comparison_no,
      sheet_a_id,
      sheet_b_id,
      sheet_a_no,
      sheet_b_no,
      survey_name,
      wave_a_label,
      wave_b_label,
      study_type,
      created_at
    FROM comparison_sets
    ORDER BY comparison_no DESC
  `;

  const result = await client.query(query);
  return result.rows;
}

export async function deleteComparisonSetById(client, comparisonSetId) {
  const query = `
    DELETE FROM comparison_sets
    WHERE comparison_set_id = $1
    RETURNING comparison_set_id, comparison_no
  `;

  const result = await client.query(query, [comparisonSetId]);
  return result.rows[0] || null;
}
