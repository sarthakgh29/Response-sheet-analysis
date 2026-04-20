import { uploadAndStoreSheet } from '../services/upload.service.js';
import { getSheet, listSheets, deleteSheet } from '../services/sheet.service.js';

export async function uploadSheet(req, res, next) {
  try {
    res.status(201).json(await uploadAndStoreSheet(req.file));
  } catch (error) {
    next(error);
  }
}

export async function getSheets(_req, res, next) {
  try {
    const sheets = await listSheets();
    res.json(
      sheets.map((row) => ({
        sheetId: row.sheet_id,
        sheetNo: row.sheet_no,
        fileName: row.file_name,
        uploadedAt: row.uploaded_at,
        studyType: row.study_type,
        totalRespondents: row.total_respondents,
        completed: row.completed,
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function getSheetById(req, res, next) {
  try {
    const sheet = await getSheet(req.params.id);
    if (!sheet) return res.status(404).json({ message: 'Sheet not found.' });
    res.json(sheet);
  } catch (error) {
    next(error);
  }
}

export async function deleteSheetById(req, res, next) {
  try {
    const deleted = await deleteSheet(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Sheet not found.' });
    }

    res.json({
      message: 'Sheet deleted successfully.',
      sheetId: deleted.sheetId,
      sheetNo: deleted.sheetNo,
      fileName: deleted.fileName,
    });
  } catch (error) {
    next(error);
  }
}
