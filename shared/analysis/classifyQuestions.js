import { mean, median, stddev, distribution } from '../utils/stats.js';
import { s } from '../utils/normalize.js';

function isDerivedOrLogicQuestion(code, text) {
  const c = s(code);
  const t = s(text);

  if (!c || !t) return true;

  // Derived/equation/helper fields
  if (/^EQ_/i.test(c)) return true;

  // Screener/system fields should not appear in main tabs
  if (/^S0_/i.test(c)) return true;
  if (/^BP/i.test(c)) return true;

  // LimeSurvey logic / expression text
  if (/^\{if\s*\(/i.test(t)) return true;
  if (/^\{.*\}$/i.test(t) && /(if\s*\(|==|!=|\|\||&&)/i.test(t)) return true;
  if (/[{}]/.test(t) && /(if\s*\(|==|!=|\|\||&&)/i.test(t)) return true;

  // Ignore obviously broken text
  if (t.toLowerCase() === 'nan') return true;

  return false;
}

export function classifyQuestions({ respondents, qCodes, qTexts, metaCols }) {
  const questions = [];
  const metaNames = new Set(
    metaCols.map((value) => s(value).toLowerCase()).filter(Boolean)
  );

  const totalColumns = Math.max(metaCols.length, qCodes.length, qTexts.length);

  for (let colIdx = 0; colIdx < totalColumns; colIdx += 1) {
    const code = s(qCodes[colIdx]);
    const text = s(qTexts[colIdx]);

    if (!code || !text) continue;
    if (/^\d+$/.test(code)) continue;
    if (metaNames.has(code.toLowerCase())) continue;
    if (isDerivedOrLogicQuestion(code, text)) continue;

    const values = respondents
      .map((respondent) => respondent._row[colIdx])
      .filter(
        (value) =>
          value != null &&
          s(value) &&
          s(value) !== '---' &&
          s(value).toLowerCase() !== 'nan'
      );

    if (values.length < 3) continue;

    const cleanedValues = values.map((value) => s(value));
    const numericValues = cleanedValues
      .map((value) => parseFloat(value))
      .filter((value) => !Number.isNaN(value));

    const uniqueValues = [...new Set(cleanedValues)];
    const numericRatio = numericValues.length / cleanedValues.length;
    const uniquenessRatio = uniqueValues.length / cleanedValues.length;

    const min = numericValues.length ? Math.min(...numericValues) : null;
    const max = numericValues.length ? Math.max(...numericValues) : null;

    // Real scale: mostly numeric and clearly a bounded rating scale
    const isScale =
      numericValues.length >= 3 &&
      numericRatio >= 0.8 &&
      min >= 1 &&
      max <= 10 &&
      max > 1;

    // Real categorical:
    // 1) non-numeric categories
    // 2) OR numeric-coded categories that are NOT scale questions
    const isCategorical =
      uniqueValues.length >= 2 &&
      uniqueValues.length <= 20 &&
      uniquenessRatio <= 0.6 &&
      (
        numericRatio < 0.3 ||
        (numericRatio >= 0.3 && !isScale && uniqueValues.length <= 12)
      );

    if (!isScale && !isCategorical) continue;

    const question = {
      code,
      text,
      colIdx,
      type: isScale ? 'scale' : 'categorical',
      n: cleanedValues.length,
      values: cleanedValues,
      numVals: numericValues,
      stats: null,
      catStats: null,
    };

    if (isScale) {
      const avg = mean(numericValues);
      const med = median(numericValues);
      const sd = stddev(numericValues);
      const top2boxThreshold = max >= 7 ? max - 1 : max;

      question.stats = {
        mean: Number(avg.toFixed(2)),
        median: Number(med.toFixed(2)),
        std: Number(sd.toFixed(2)),
        top2box: Number(
          (
            (numericValues.filter((value) => value >= top2boxThreshold).length /
              numericValues.length) *
            100
          ).toFixed(1)
        ),
        min,
        max,
        distribution: distribution(numericValues),
      };
    }

    if (isCategorical) {
      const counts = {};
      for (const value of cleanedValues) {
        counts[value] = (counts[value] || 0) + 1;
      }

      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

      const total = cleanedValues.length;

      question.catStats = {
        counts: Object.fromEntries(sorted),
        pct: Object.fromEntries(
          sorted.map(([key, count]) => [key, Number(((count / total) * 100).toFixed(1))])
        ),
      };
    }

    questions.push(question);
  }

  return {
    questions,
    scaleQs: questions.filter((question) => question.type === 'scale'),
    catQs: questions.filter((question) => question.type === 'categorical'),
  };
}
