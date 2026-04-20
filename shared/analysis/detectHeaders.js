import { lowerUnderscore, s } from '../utils/normalize.js';

export function detectHeaders(rawRows) {
  if (!rawRows || rawRows.length < 8) {
    throw new Error('CSV file is too short to be a valid LimeSurvey export.');
  }

  let headerIndex = -1;
  for (let i = 0; i < Math.min(10, rawRows.length); i += 1) {
    const normalized = rawRows[i].map((cell) => lowerUnderscore(cell));
    if (normalized.includes('id') && (normalized.includes('status') || normalized.includes('first_name') || normalized.includes('npi'))) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex < 0) {
    throw new Error('Could not detect LimeSurvey header row.');
  }

  const metaCols = rawRows[headerIndex].map((cell) => s(cell));
  const qCodes = rawRows[headerIndex + 2] || [];
  const qTexts = rawRows[headerIndex + 3] || [];
  const typeHints = rawRows[headerIndex + 5] || [];

  let dataStartIndex = headerIndex + 6;
  for (let i = headerIndex + 4; i < rawRows.length; i += 1) {
    const idValue = parseFloat(rawRows[i]?.[0]);
    if (!Number.isNaN(idValue) && idValue > 100000) {
      dataStartIndex = i;
      break;
    }
  }

  return { headerIndex, metaCols, qCodes, qTexts, typeHints, dataStartIndex };
}
