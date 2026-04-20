import {
  createComparisonSetFromSheetIds,
  createComparisonSetFromFiles,
  getComparisonSet,
  listComparisonSets,
  removeComparisonSet,
} from '../services/comparison.service.js';
import { answerComparisonQuestion } from '../services/comparisonChat.service.js';

export async function createComparison(req, res, next) {
  try {
    const { sheetAId, sheetBId, surveyName, waveALabel, waveBLabel } = req.body;

    const result = await createComparisonSetFromSheetIds({
      sheetAId,
      sheetBId,
      surveyName,
      waveALabel,
      waveBLabel,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function uploadComparison(req, res, next) {
  try {
    const fileA = req.files?.waveA?.[0];
    const fileB = req.files?.waveB?.[0];

    const result = await createComparisonSetFromFiles({
      fileA,
      fileB,
      surveyName: req.body.surveyName,
      waveALabel: req.body.waveALabel,
      waveBLabel: req.body.waveBLabel,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getComparisons(_req, res, next) {
  try {
    const comparisons = await listComparisonSets();
    res.json(comparisons);
  } catch (error) {
    next(error);
  }
}

export async function getComparisonById(req, res, next) {
  try {
    const result = await getComparisonSet(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Comparison set not found.' });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function askComparisonQuestion(req, res, next) {
  try {
    const message = req.body?.message;
    if (!message) {
      return res.status(400).json({ message: 'message is required.' });
    }

    const result = await answerComparisonQuestion(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteComparison(req, res, next) {
  try {
    const deleted = await removeComparisonSet(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Comparison set not found.' });
    }

    res.json({
      message: `Comparison #${deleted.comparisonNo} deleted successfully.`,
      deleted,
    });
  } catch (error) {
    next(error);
  }
}
