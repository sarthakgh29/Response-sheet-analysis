import { pool } from '../config/db.js';
import { analyzeCsvBuffer } from './analysis.service.js';
import { insertResponseSheet } from '../repositories/responseSheets.repository.js';
import { insertOverview } from '../repositories/overview.repository.js';
import { insertTimelineRows } from '../repositories/timeline.repository.js';
import { insertScreenerSummary } from '../repositories/screenerSummary.repository.js';

export async function storeSheetFromFile(client, file) {
  const analysis = analyzeCsvBuffer(file.buffer, file.originalname);

  const sheet = await insertResponseSheet(client, {
    fileName: file.originalname,
    studyType: analysis.meta.screener.studyType,
    analysisVersion: 'v1',
    analysisJson: analysis,
  });

  await insertOverview(client, sheet.sheet_id, sheet.sheet_no, {
    total: analysis.meta.total,
    completed: analysis.meta.completed,
    partial: analysis.meta.statuses.Partial || 0,
    panelFail: analysis.meta.screener.psfCount,
    waveFail: analysis.meta.screener.wsfCount,
    outliersCount: Object.values(analysis.meta.outliers).reduce((acc, value) => acc + value, 0),
    avgRating: analysis.meta.avgRating,
    timings: analysis.meta.timings,
  });

  await insertTimelineRows(client, sheet.sheet_id, sheet.sheet_no, analysis.meta.timeline);
  await insertScreenerSummary(client, sheet.sheet_id, sheet.sheet_no, analysis.meta.screener);

  return { sheet, analysis };
}

export async function uploadAndStoreSheet(file) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { sheet, analysis } = await storeSheetFromFile(client, file);

    await client.query('COMMIT');

    return {
      sheetId: sheet.sheet_id,
      sheetNo: sheet.sheet_no,
      fileName: sheet.file_name,
      uploadedAt: sheet.uploaded_at,
      studyType: sheet.study_type,
      overview: {
        totalRespondents: analysis.meta.total,
        completed: analysis.meta.completed,
        partial: analysis.meta.statuses.Partial || 0,
        panelFail: analysis.meta.screener.psfCount,
        waveFail: analysis.meta.screener.wsfCount,
        outliersCount: Object.values(analysis.meta.outliers).reduce((acc, value) => acc + value, 0),
        avgRating: analysis.meta.avgRating,
        medianTime: analysis.meta.timings?.median ?? null,
        meanTime: analysis.meta.timings?.mean ?? null,
        minTime: analysis.meta.timings?.min ?? null,
        maxTime: analysis.meta.timings?.max ?? null,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}