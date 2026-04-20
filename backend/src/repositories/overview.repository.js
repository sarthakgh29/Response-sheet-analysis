export async function insertOverview(client, sheetId, sheetNo, overview) {
  const query = `
    INSERT INTO overview (
      sheet_id,
      sheet_no,
      total_respondents,
      completed,
      partial,
      panel_fail,
      wave_fail,
      outliers_count,
      avg_rating,
      median_time,
      mean_time,
      min_time,
      max_time
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `;

  await client.query(query, [
    sheetId,
    sheetNo,
    overview.total,
    overview.completed,
    overview.partial,
    overview.panelFail,
    overview.waveFail,
    overview.outliersCount,
    overview.avgRating,
    overview.timings?.median ?? null,
    overview.timings?.mean ?? null,
    overview.timings?.min ?? null,
    overview.timings?.max ?? null,
  ]);
}

export async function getOverviewBySheetId(client, sheetId) {
  const result = await client.query(
    'SELECT * FROM overview WHERE sheet_id = $1',
    [sheetId]
  );
  return result.rows[0] || null;
}