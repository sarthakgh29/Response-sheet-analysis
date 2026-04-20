import { Router } from 'express';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';
import { validateUploadRequest } from '../validators/sheet.validators.js';
import {
  getSheetById,
  getSheets,
  uploadSheet,
  deleteSheetById,
} from '../controllers/sheets.controller.js';

const router = Router();

router.post('/upload', uploadMiddleware.single('file'), validateUploadRequest, uploadSheet);
router.get('/', getSheets);
router.get('/:id', getSheetById);
router.delete('/:id', deleteSheetById);

export default router;
