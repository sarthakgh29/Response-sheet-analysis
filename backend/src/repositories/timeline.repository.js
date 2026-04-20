export async function insertTimelineRows(client, sheetId, sheetNo, timeline) {
  if (!timeline.length) return;

  const values = [];
  const placeholders = timeline
    .map((row, index) => {
      const offset = index * 4;
      values.push(sheetId, sheetNo, row.date, row.count);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    })
    .join(', ');

  await client.query(
    `INSERT INTO timeline (sheet_id, sheet_no, date, completions_count) VALUES ${placeholders}`,
    values
  );
}

export async function getTimelineBySheetId(client, sheetId) {
  const result = await client.query(
    'SELECT id, sheet_id, sheet_no, date, completions_count FROM timeline WHERE sheet_id = $1 ORDER BY date ASC',
    [sheetId]
  );
  return result.rows;
}