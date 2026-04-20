function normalizeCode(code) {
  return String(code || '').trim();
}

function getComparableQuestionCodes(analysis) {
  const scaleCodes = (analysis.scaleQs || []).map((q) => normalizeCode(q.code));
  const catCodes = (analysis.catQs || []).map((q) => normalizeCode(q.code));
  return [...new Set([...scaleCodes, ...catCodes].filter(Boolean))];
}

export function validateComparison(analysisA, analysisB) {
  const errors = [];
  const warnings = [];

  if (!analysisA || !analysisB) {
    return {
      valid: false,
      errors: ['One or both analyses are missing.'],
      warnings: [],
      metrics: null,
    };
  }

  const studyTypeA = analysisA.meta?.screener?.studyType || null;
  const studyTypeB = analysisB.meta?.screener?.studyType || null;

  if (studyTypeA && studyTypeB && studyTypeA !== studyTypeB) {
    errors.push(`Study type mismatch: ${studyTypeA} vs ${studyTypeB}.`);
  }

  const codesA = getComparableQuestionCodes(analysisA);
  const codesB = getComparableQuestionCodes(analysisB);

  if (!codesA.length || !codesB.length) {
    errors.push('One or both sheets have no comparable question codes.');
  }

  const setB = new Set(codesB);
  const intersection = codesA.filter((code) => setB.has(code));
  const union = [...new Set([...codesA, ...codesB])];

  const overlapRatio = union.length ? intersection.length / union.length : 0;

  if (overlapRatio < 0.8) {
    errors.push(
      `Question-code overlap is too low (${(overlapRatio * 100).toFixed(1)}%). Expected at least 80%.`
    );
  } else if (overlapRatio < 0.9) {
    warnings.push(
      `Question-code overlap is moderate (${(overlapRatio * 100).toFixed(1)}%). Comparison is allowed, but review differences carefully.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      studyTypeA,
      studyTypeB,
      codeCountA: codesA.length,
      codeCountB: codesB.length,
      overlapCount: intersection.length,
      unionCount: union.length,
      overlapRatio: Number(overlapRatio.toFixed(4)),
      sharedCodes: intersection,
    },
  };
}