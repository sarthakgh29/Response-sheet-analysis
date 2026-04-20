export async function insertScreenerSummary(client, sheetId, sheetNo, screener) {
  const query = `
    INSERT INTO screener_summary (
      sheet_id,
      sheet_no,
      total_screenouts,
      panel_screenouts,
      wave_screenouts,
      primary_screenout_question,
      primary_screenout_count,
      primary_panel_question,
      primary_panel_count,
      primary_wave_question,
      primary_wave_count
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `;

  await client.query(query, [
    sheetId,
    sheetNo,
    screener.totalOut,
    screener.psfCount,
    screener.wsfCount,
    screener.primDO?.qText ?? null,
    screener.primDO?.count ?? null,
    screener.primPSF?.qText ?? null,
    screener.primPSF?.screenTypes?.Panel ?? null,
    screener.primWSF?.qText ?? null,
    screener.primWSF?.screenTypes?.Wave ?? null,
  ]);
}

export async function getScreenerSummaryBySheetId(client, sheetId) {
  const result = await client.query(
    'SELECT * FROM screener_summary WHERE sheet_id = $1',
    [sheetId]
  );
  return result.rows[0] || null;
}