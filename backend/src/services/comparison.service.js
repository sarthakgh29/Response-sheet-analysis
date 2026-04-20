import { randomUUID } from 'crypto';
import { pool } from '../config/db.js';
import {
  insertComparisonSet,
  getComparisonSetById,
  getAllComparisonSets,
  deleteComparisonSetById,
} from '../repositories/comparisonSets.repository.js';
import { getResponseSheetByIdOrSheetNo } from '../repositories/responseSheets.repository.js';
import { validateComparison } from '../../../shared/analysis/validateComparison.js';
import { compareSheets } from '../../../shared/analysis/compareSheets.js';
import { storeSheetFromFile } from './upload.service.js';

function mapComparisonRow(row) {
  return {
    comparisonSetId: row.comparison_set_id,
    comparisonNo: row.comparison_no,
    sheetAId: row.sheet_a_id,
    sheetBId: row.sheet_b_id,
    sheetANo: row.sheet_a_no,
    sheetBNo: row.sheet_b_no,
    surveyName: row.survey_name,
    waveALabel: row.wave_a_label,
    waveBLabel: row.wave_b_label,
    studyType: row.study_type,
    createdAt: row.created_at,
  };
}

async function createAndStoreComparison(client, {
  sheetA,
  sheetB,
  analysisA,
  analysisB,
  surveyName,
  waveALabel,
  waveBLabel,
}) {
  const validation = validateComparison(analysisA, analysisB);
  if (!validation.valid) {
    throw new Error(`Comparison validation failed: ${validation.errors.join(' | ')}`);
  }

  const comparisonJson = compareSheets(analysisA, analysisB, {
    surveyName,
    waveALabel,
    waveBLabel,
    studyType: sheetA.study_type || sheetB.study_type || null,
  });

  const inserted = await insertComparisonSet(client, {
    comparisonSetId: randomUUID(),
    sheetAId: sheetA.sheet_id,
    sheetBId: sheetB.sheet_id,
    sheetANo: sheetA.sheet_no,
    sheetBNo: sheetB.sheet_no,
    surveyName: surveyName || null,
    waveALabel: waveALabel || 'Wave A',
    waveBLabel: waveBLabel || 'Wave B',
    studyType: sheetA.study_type || sheetB.study_type || null,
    comparisonJson,
  });

  return {
    comparison: mapComparisonRow(inserted),
    comparisonJson,
    validation,
  };
}

export async function createComparisonSetFromSheetIds({
  sheetAId,
  sheetBId,
  surveyName,
  waveALabel,
  waveBLabel,
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const sheetA = await getResponseSheetByIdOrSheetNo(client, sheetAId);
    const sheetB = await getResponseSheetByIdOrSheetNo(client, sheetBId);

    if (!sheetA || !sheetB) {
      throw new Error('One or both sheets were not found.');
    }

    if (sheetA.sheet_id === sheetB.sheet_id) {
      throw new Error('Please choose two different sheets for comparison.');
    }

    const result = await createAndStoreComparison(client, {
      sheetA,
      sheetB,
      analysisA: sheetA.analysis_json,
      analysisB: sheetB.analysis_json,
      surveyName,
      waveALabel,
      waveBLabel,
    });

    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function createComparisonSetFromFiles({
  fileA,
  fileB,
  surveyName,
  waveALabel,
  waveBLabel,
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { sheet: sheetA, analysis: analysisA } = await storeSheetFromFile(client, fileA);
    const { sheet: sheetB, analysis: analysisB } = await storeSheetFromFile(client, fileB);

    const result = await createAndStoreComparison(client, {
      sheetA,
      sheetB,
      analysisA,
      analysisB,
      surveyName,
      waveALabel,
      waveBLabel,
    });

    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getComparisonSet(comparisonSetId) {
  const client = await pool.connect();

  try {
    const row = await getComparisonSetById(client, comparisonSetId);
    if (!row) return null;

    return {
      comparison: mapComparisonRow(row),
      comparisonJson: row.comparison_json,
    };
  } finally {
    client.release();
  }
}

export async function listComparisonSets() {
  const client = await pool.connect();

  try {
    const rows = await getAllComparisonSets(client);
    return rows.map(mapComparisonRow);
  } finally {
    client.release();
  }
}

export async function removeComparisonSet(comparisonSetId) {
  const client = await pool.connect();

  try {
    const deleted = await deleteComparisonSetById(client, comparisonSetId);
    if (!deleted) return null;

    return {
      comparisonSetId: deleted.comparison_set_id,
      comparisonNo: deleted.comparison_no,
    };
  } finally {
    client.release();
  }
}
