function normalizeCode(code) {
  return String(code || '').trim();
}

function normalizeText(text) {
  return String(text || '').trim();
}

function isDerivedOrLogicQuestion(code, text) {
  const c = normalizeCode(code);
  const t = normalizeText(text);

  if (!c || !t) return true;
  if (/^EQ_/i.test(c)) return true;
  if (/^S0_/i.test(c)) return true;
  if (/^BP/i.test(c)) return true;

  if (/^\{if\s*\(/i.test(t)) return true;
  if (/^\{.*\}$/i.test(t) && /(if\s*\(|==|!=|\|\||&&)/i.test(t)) return true;
  if (/[{}]/.test(t) && /(if\s*\(|==|!=|\|\||&&)/i.test(t)) return true;

  return false;
}

function buildQuestionMap(analysis = {}) {
  const map = new Map();
  const push = (questions = [], type) => {
    questions.forEach((q) => {
      const code = normalizeCode(q.code);
      const text = normalizeText(q.text || q.questionText || code);
      if (!code || isDerivedOrLogicQuestion(code, text)) return;

      const existing = map.get(code);
      if (!existing) {
        map.set(code, { code, text, types: [type] });
        return;
      }

      if (!existing.types.includes(type)) existing.types.push(type);
      if ((!existing.text || existing.text === existing.code) && text) existing.text = text;
    });
  };

  push(analysis.scaleQs || [], 'Scale');
  push(analysis.catQs || [], 'Categorical');
  return map;
}

function round1(value) {
  return Number((value || 0).toFixed(1));
}

export function validateComparison(analysisA, analysisB) {
  if (!analysisA || !analysisB) {
    return {
      valid: false,
      errors: ['Missing analysis for one or both sheets.'],
    };
  }

  const mapA = buildQuestionMap(analysisA);
  const mapB = buildQuestionMap(analysisB);

  const codesA = [...mapA.keys()];
  const codesB = [...mapB.keys()];
  const unionCodes = [...new Set([...codesA, ...codesB])].sort();
  const sharedCodes = unionCodes.filter((code) => mapA.has(code) && mapB.has(code));
  const onlyInWaveA = unionCodes.filter((code) => mapA.has(code) && !mapB.has(code));
  const onlyInWaveB = unionCodes.filter((code) => mapB.has(code) && !mapA.has(code));

  const totalUniqueQuestions = unionCodes.length;
  const overlapPct = totalUniqueQuestions
    ? round1((sharedCodes.length / totalUniqueQuestions) * 100)
    : 0;

  const warnings = [];
  if (overlapPct < 50) {
    warnings.push('Question overlap is below 50%. Comparison should open in questions-only mode.');
  }

  return {
    valid: true,
    errors: [],
    warnings,
    overlapPct,
    comparisonMode: overlapPct >= 50 ? 'full' : 'questions-only',
    totalWaveAQuestions: mapA.size,
    totalWaveBQuestions: mapB.size,
    totalUniqueQuestions,
    sharedQuestionCount: sharedCodes.length,
    onlyInWaveACount: onlyInWaveA.length,
    onlyInWaveBCount: onlyInWaveB.length,
  };
}
