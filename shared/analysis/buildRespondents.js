import { lowerUnderscore, s, toNumber } from '../utils/normalize.js';

function getAliasesMap(metaCols) {
  const meta = {};
  metaCols.forEach((name, index) => {
    const key = lowerUnderscore(name);
    meta[key] = index;
  });
  return meta;
}

function get(meta, row, ...keys) {
  for (const key of keys) {
    const idx = meta[key];
    if (idx !== undefined) return row[idx] ?? null;
  }
  return null;
}

export function buildRespondents(rawRows, metaCols, dataStartIndex) {
  const meta = getAliasesMap(metaCols);
  const dataRows = rawRows.slice(dataStartIndex).filter((row) => {
    const value = parseFloat(s(row[0]));
    return !Number.isNaN(value) && value > 100000;
  });

  const respondents = dataRows.map((row) => {
    const seconds = toNumber(get(meta, row, 'time_taken'));
    return {
      id: s(get(meta, row, 'id')),
      firstName: s(get(meta, row, 'first_name')),
      lastName: s(get(meta, row, 'last_name')),
      npi: s(get(meta, row, 'npi')),
      email: s(get(meta, row, 'email')),
      status: s(get(meta, row, 'status')),
      outlierType: s(get(meta, row, 'outlier_type')),
      localOLQuestions: s(get(meta, row, 'local_ol_questions')),
      userRating: toNumber(get(meta, row, 'user_rating')),
      timeTakenMin: seconds ? Number((seconds / 60).toFixed(1)) : null,
      startUTC: get(meta, row, 'start_date_utc'),
      endUTC: get(meta, row, 'end_date_utc'),
      timezone: get(meta, row, 'timezone'),
      isStitched: s(get(meta, row, 'is_stitched')) || 'No',
      surveySource: s(get(meta, row, 'survey_source')),
      _row: row,
    };
  });

  return { respondents, metaMap: meta };
}
