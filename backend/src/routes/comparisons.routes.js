import { Router } from 'express';
import {
  createComparison,
  uploadComparison,
  getComparisons,
  getComparisonById,
  askComparisonQuestion,
  deleteComparison,
} from '../controllers/comparisons.controller.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';
import { validateComparisonUploadRequest } from '../validators/comparison.validators.js';

const router = Router();

router.post('/', createComparison);

router.post(
  '/upload',
  uploadMiddleware.fields([
    { name: 'waveA', maxCount: 1 },
    { name: 'waveB', maxCount: 1 },
  ]),
  validateComparisonUploadRequest,
  uploadComparison
);

router.get('/', getComparisons);
router.get('/:id', getComparisonById);
router.post('/:id/chat', askComparisonQuestion);
router.delete('/:id', deleteComparison);

export default router;
