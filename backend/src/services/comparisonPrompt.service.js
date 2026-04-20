function topScaleShiftRows(scaleComparison, limit = 8) {
  const rows = [...(scaleComparison?.rows || [])]
    .filter((row) => row.deltaT2B != null)
    .sort((a, b) => Math.abs(b.deltaT2B) - Math.abs(a.deltaT2B))
    .slice(0, limit);

  return rows.map((row) => ({
    code: row.code,
    text: row.text,
    waveA_t2b: row.waveA?.t2b,
    waveB_t2b: row.waveB?.t2b,
    deltaT2B: row.deltaT2B,
    waveA_mean: row.waveA?.mean,
    waveB_mean: row.waveB?.mean,
    deltaMean: row.deltaMean,
  }));
}

function topCategoricalShiftRows(categoricalComparison, limit = 8) {
  const items = [];

  for (const row of categoricalComparison?.rows || []) {
    for (const option of row.options || []) {
      items.push({
        code: row.code,
        text: row.text,
        option: option.option,
        waveA_pct: option.waveA_pct,
        waveB_pct: option.waveB_pct,
        delta_pct: option.delta_pct,
      });
    }
  }

  return items
    .sort((a, b) => Math.abs(b.delta_pct || 0) - Math.abs(a.delta_pct || 0))
    .slice(0, limit);
}

export function buildComparisonSystemPrompt(comparisonJson, comparisonMeta) {
  const overview = comparisonJson.overviewComparison || {};
  const screener = comparisonJson.screenerComparison || {};
  const timeline = comparisonJson.timelineComparison || {};
  const scale = comparisonJson.scaleComparison || {};
  const categorical = comparisonJson.categoricalComparison || {};
  const outliers = comparisonJson.outlierComparison || {};
  const summary = comparisonJson.summary || {};

  const topScaleShifts = topScaleShiftRows(scale, 10);
  const topCategoricalShifts = topCategoricalShiftRows(categorical, 12);

  return `
You are a senior market research analyst helping compare two waves of the same survey.

The user is asking questions about a wave-to-wave comparison.

Survey metadata:
- Survey name: ${comparisonMeta?.surveyName || comparisonJson.meta?.surveyName || 'Unknown survey'}
- Wave A label: ${comparisonMeta?.waveALabel || comparisonJson.meta?.waveALabel || 'Wave A'}
- Wave B label: ${comparisonMeta?.waveBLabel || comparisonJson.meta?.waveBLabel || 'Wave B'}
- Study type: ${comparisonMeta?.studyType || comparisonJson.meta?.studyType || 'Unknown'}

Overview comparison:
${JSON.stringify(overview, null, 2)}

Screener comparison:
${JSON.stringify(screener, null, 2)}

Timeline comparison summary:
${JSON.stringify({
  totalFieldingDays: timeline.totalFieldingDays,
  waveAFieldingDays: timeline.waveAFieldingDays,
  waveBFieldingDays: timeline.waveBFieldingDays,
  waveAStartDate: timeline.waveAStartDate,
  waveAEndDate: timeline.waveAEndDate,
  waveBStartDate: timeline.waveBStartDate,
  waveBEndDate: timeline.waveBEndDate,
}, null, 2)}

Scale comparison summary:
${JSON.stringify({
  totalSharedScaleQuestions: scale.totalSharedScaleQuestions,
  biggestT2BIncrease: scale.biggestT2BIncrease,
  biggestT2BDecline: scale.biggestT2BDecline,
  topScaleShifts,
}, null, 2)}

Categorical comparison summary:
${JSON.stringify({
  totalSharedCategoricalQuestions: categorical.totalSharedCategoricalQuestions,
  topCategoricalShifts,
}, null, 2)}

Outlier comparison:
${JSON.stringify(outliers, null, 2)}

High-level summary:
${JSON.stringify(summary, null, 2)}

Instructions:
- Answer only using the comparison information provided.
- Focus on differences between Wave A and Wave B.
- Highlight important improvements, declines, and noteworthy shifts.
- If the user asks for implications, explain what the differences suggest.
- Be concise but insightful.
- Prefer structured bullet points when useful.
`;
}