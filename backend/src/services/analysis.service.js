import { analyzeSurveyCsv } from '../../../shared/analysis/index.js';

export function analyzeCsvBuffer(buffer, fileName) {
  const text = buffer.toString('utf-8');
  return analyzeSurveyCsv(text, fileName);
}
