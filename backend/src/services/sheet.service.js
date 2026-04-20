import { pool } from '../config/db.js';
import {
  getAllResponseSheets,
  getResponseSheetById,
  deleteResponseSheetById,
} from '../repositories/responseSheets.repository.js';
import { getOverviewBySheetId } from '../repositories/overview.repository.js';
import { getTimelineBySheetId } from '../repositories/timeline.repository.js';
import { getScreenerSummaryBySheetId } from '../repositories/screenerSummary.repository.js';

export async function listSheets() {
  const client = await pool.connect();
  try {
    return await getAllResponseSheets(client);
  } finally {
    client.release();
  }
}

export async function getSheet(sheetId) {
  const client = await pool.connect();
  try {
    const sheet = await getResponseSheetById(client, sheetId);
    if (!sheet) return null;

    const overview = await getOverviewBySheetId(client, sheetId);
    const timeline = await getTimelineBySheetId(client, sheetId);
    const screenerSummary = await getScreenerSummaryBySheetId(client, sheetId);

    return {
      sheet: {
        sheetId: sheet.sheet_id,
        sheetNo: sheet.sheet_no,
        fileName: sheet.file_name,
        uploadedAt: sheet.uploaded_at,
        studyType: sheet.study_type,
        analysisVersion: sheet.analysis_version,
      },
      overview,
      timeline: timeline.map((row) => ({
        id: row.id,
        date: row.date,
        completionsCount: row.completions_count,
      })),
      screenerSummary,
      analysis: sheet.analysis_json,
    };
  } finally {
    client.release();
  }
}

export async function deleteSheet(sheetId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const deleted = await deleteResponseSheetById(client, sheetId);
    if (!deleted) {
      await client.query('ROLLBACK');
      return null;
    }
    await client.query('COMMIT');
    return {
      sheetId: deleted.sheet_id,
      sheetNo: deleted.sheet_no,
      fileName: deleted.file_name,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
