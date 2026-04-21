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

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function round1(value) {
  return Number((value || 0).toFixed(1));
}

function compareMetric(a, b) {
  const aNum = toNumber(a);
  const bNum = toNumber(b);

  if (aNum == null || bNum == null) {
    return {
      waveA: a,
      waveB: b,
      delta: null,
      pctChange: null,
    };
  }

  const delta = Number((bNum - aNum).toFixed(2));
  const pctChange = aNum === 0 ? null : Number((((bNum - aNum) / aNum) * 100).toFixed(1));

  return {
    waveA: aNum,
    waveB: bNum,
    delta,
    pctChange,
  };
}

function compareOverview(metaA, metaB) {
  return {
    totalRespondents: compareMetric(metaA.total, metaB.total),
    completed: compareMetric(metaA.completed, metaB.completed),
    partial: compareMetric(metaA.statuses?.Partial || 0, metaB.statuses?.Partial || 0),
    panelFail: compareMetric(metaA.screener?.psfCount || 0, metaB.screener?.psfCount || 0),
    waveFail: compareMetric(metaA.screener?.wsfCount || 0, metaB.screener?.wsfCount || 0),
    avgRating: compareMetric(metaA.avgRating, metaB.avgRating),
    medianTime: compareMetric(metaA.timings?.median, metaB.timings?.median),
    meanTime: compareMetric(metaA.timings?.mean, metaB.timings?.mean),
    outlierCount: compareMetric(
      Object.values(metaA.outliers || {}).reduce((a, b) => a + b, 0),
      Object.values(metaB.outliers || {}).reduce((a, b) => a + b, 0)
    ),
  };
}

function mapByCode(questions = []) {
  const map = new Map();
  questions.forEach((q) => {
    const code = normalizeCode(q.code);
    if (code) map.set(code, q);
  });
  return map;
}

function compareScaleQuestions(scaleA = [], scaleB = []) {
  const filteredA = scaleA.filter((q) => !isDerivedOrLogicQuestion(q.code, q.text));
  const filteredB = scaleB.filter((q) => !isDerivedOrLogicQuestion(q.code, q.text));

  const mapA = mapByCode(filteredA);
  const mapB = mapByCode(filteredB);

  const sharedCodes = [...mapA.keys()].filter((code) => mapB.has(code));

  const rows = sharedCodes.map((code) => {
    const qA = mapA.get(code);
    const qB = mapB.get(code);

    return {
      code,
      text: qA.text || qB.text || code,
      waveA: {
        mean: qA.stats?.mean ?? null,
        median: qA.stats?.median ?? null,
        t2b: qA.stats?.top2box ?? null,
        n: qA.n ?? null,
      },
      waveB: {
        mean: qB.stats?.mean ?? null,
        median: qB.stats?.median ?? null,
        t2b: qB.stats?.top2box ?? null,
        n: qB.n ?? null,
      },
      deltaMean: compareMetric(qA.stats?.mean, qB.stats?.mean).delta,
      deltaT2B: compareMetric(qA.stats?.top2box, qB.stats?.top2box).delta,
    };
  });

  const sortedByT2BDelta = [...rows].sort(
    (a, b) => (b.deltaT2B ?? -9999) - (a.deltaT2B ?? -9999)
  );

  return {
    totalSharedScaleQuestions: rows.length,
    rows,
    biggestT2BIncrease: sortedByT2BDelta[0] || null,
    biggestT2BDecline: sortedByT2BDelta[sortedByT2BDelta.length - 1] || null,
  };
}

function compareCategoricalQuestions(catA = [], catB = []) {
  const filteredA = catA.filter((q) => !isDerivedOrLogicQuestion(q.code, q.text));
  const filteredB = catB.filter((q) => !isDerivedOrLogicQuestion(q.code, q.text));

  const mapA = mapByCode(filteredA);
  const mapB = mapByCode(filteredB);

  const sharedCodes = [...mapA.keys()].filter((code) => mapB.has(code));

  const rows = sharedCodes.map((code) => {
    const qA = mapA.get(code);
    const qB = mapB.get(code);

    const options = [
      ...new Set([
        ...Object.keys(qA.catStats?.pct || {}),
        ...Object.keys(qB.catStats?.pct || {}),
      ]),
    ];

    return {
      code,
      text: qA.text || qB.text || code,
      nA: qA.n ?? null,
      nB: qB.n ?? null,
      options: options.map((option) => ({
        option,
        waveA_count: qA.catStats?.counts?.[option] ?? 0,
        waveA_pct: qA.catStats?.pct?.[option] ?? 0,
        waveB_count: qB.catStats?.counts?.[option] ?? 0,
        waveB_pct: qB.catStats?.pct?.[option] ?? 0,
        delta_pct: Number(((qB.catStats?.pct?.[option] ?? 0) - (qA.catStats?.pct?.[option] ?? 0)).toFixed(1)),
      })),
    };
  });

  return {
    totalSharedCategoricalQuestions: rows.length,
    rows,
  };
}

function buildRelativeTimelineRows(timeline = []) {
  const sorted = [...(timeline || [])].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return sorted.map((row, index) => ({
    dayIndex: index + 1,
    date: String(row.date || ''),
    count: Number(row.count || row.completionsCount || 0),
  }));
}

function compareTimeline(metaA, metaB) {
  const rowsA = buildRelativeTimelineRows(metaA.timeline || []);
  const rowsB = buildRelativeTimelineRows(metaB.timeline || []);

  const maxDays = Math.max(rowsA.length, rowsB.length);
  const rows = [];

  for (let i = 0; i < maxDays; i += 1) {
    const a = rowsA[i] || null;
    const b = rowsB[i] || null;

    rows.push({
      dayIndex: i + 1,
      waveA: a?.count || 0,
      waveB: b?.count || 0,
      waveADate: a?.date || null,
      waveBDate: b?.date || null,
      delta: (b?.count || 0) - (a?.count || 0),
    });
  }

  return {
    totalFieldingDays: maxDays,
    waveAFieldingDays: rowsA.length,
    waveBFieldingDays: rowsB.length,
    waveAStartDate: rowsA[0]?.date || null,
    waveAEndDate: rowsA[rowsA.length - 1]?.date || null,
    waveBStartDate: rowsB[0]?.date || null,
    waveBEndDate: rowsB[rowsB.length - 1]?.date || null,
    rows,
  };
}

function compareScreeners(metaA, metaB) {
  return {
    totalScreenouts: compareMetric(metaA.screener?.totalOut || 0, metaB.screener?.totalOut || 0),
    panelFail: compareMetric(metaA.screener?.psfCount || 0, metaB.screener?.psfCount || 0),
    waveFail: compareMetric(metaA.screener?.wsfCount || 0, metaB.screener?.wsfCount || 0),
    primaryPanelQuestionA: metaA.screener?.primPSF?.qText || null,
    primaryPanelQuestionB: metaB.screener?.primPSF?.qText || null,
    primaryWaveQuestionA: metaA.screener?.primWSF?.qText || null,
    primaryWaveQuestionB: metaB.screener?.primWSF?.qText || null,
  };
}

function compareOutliers(metaA, metaB) {
  const types = [...new Set([
    ...Object.keys(metaA.outliers || {}),
    ...Object.keys(metaB.outliers || {}),
  ])];

  return {
    totalOutliers: compareMetric(
      Object.values(metaA.outliers || {}).reduce((a, b) => a + b, 0),
      Object.values(metaB.outliers || {}).reduce((a, b) => a + b, 0)
    ),
    byType: types.map((type) => ({
      type,
      waveA: metaA.outliers?.[type] ?? 0,
      waveB: metaB.outliers?.[type] ?? 0,
      delta: (metaB.outliers?.[type] ?? 0) - (metaA.outliers?.[type] ?? 0),
    })),
  };
}

function buildComparableQuestionMap(analysis = {}) {
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

function buildQuestionOverlapSummary(analysisA, analysisB) {
  const mapA = buildComparableQuestionMap(analysisA);
  const mapB = buildComparableQuestionMap(analysisB);

  const allCodes = [...new Set([...mapA.keys(), ...mapB.keys()])].sort();
  const sharedCodes = allCodes.filter((code) => mapA.has(code) && mapB.has(code));
  const onlyInWaveA = allCodes.filter((code) => mapA.has(code) && !mapB.has(code));
  const onlyInWaveB = allCodes.filter((code) => mapB.has(code) && !mapA.has(code));

  const totalUniqueQuestions = allCodes.length;
  const samePct = totalUniqueQuestions ? round1((sharedCodes.length / totalUniqueQuestions) * 100) : 0;
  const differentCount = onlyInWaveA.length + onlyInWaveB.length;
  const differentPct = totalUniqueQuestions ? round1((differentCount / totalUniqueQuestions) * 100) : 0;

  const buildRows = (codes, primaryMap, secondaryMap) =>
    codes.map((code) => {
      const row = primaryMap.get(code) || secondaryMap.get(code);
      return {
        code,
        text: row?.text || code,
        types: row?.types || [],
      };
    });

  return {
    totalWaveAQuestions: mapA.size,
    totalWaveBQuestions: mapB.size,
    totalUniqueQuestions,
    sharedQuestionCount: sharedCodes.length,
    onlyInWaveACount: onlyInWaveA.length,
    onlyInWaveBCount: onlyInWaveB.length,
    samePct,
    differentPct,
    overlapPct: samePct,
    comparisonMode: samePct >= 50 ? 'full' : 'questions-only',
    sharedQuestions: buildRows(sharedCodes, mapA, mapB),
    onlyInWaveA: buildRows(onlyInWaveA, mapA, mapB),
    onlyInWaveB: buildRows(onlyInWaveB, mapB, mapA),
  };
}

function buildSummary({
  overviewComparison,
  scaleComparison,
  categoricalComparison,
  screenerComparison,
  questionOverlapSummary,
}) {
  return {
    headline: 'Wave comparison generated successfully.',
    completedDelta: overviewComparison.completed.delta,
    avgRatingDelta: overviewComparison.avgRating.delta,
    medianTimeDelta: overviewComparison.medianTime.delta,
    biggestScaleShift: scaleComparison.biggestT2BIncrease,
    screenerShift: screenerComparison.totalScreenouts.delta,
    sharedScaleQuestions: scaleComparison.totalSharedScaleQuestions,
    sharedCategoricalQuestions: categoricalComparison.totalSharedCategoricalQuestions,
    overlapPct: questionOverlapSummary.overlapPct,
    comparisonMode: questionOverlapSummary.comparisonMode,
  };
}

export function compareSheets(analysisA, analysisB, meta = {}) {
  const metaA = analysisA.meta || {};
  const metaB = analysisB.meta || {};

  const overviewComparison = compareOverview(metaA, metaB);
  const scaleComparison = compareScaleQuestions(analysisA.scaleQs || [], analysisB.scaleQs || []);
  const categoricalComparison = compareCategoricalQuestions(analysisA.catQs || [], analysisB.catQs || []);
  const timelineComparison = compareTimeline(metaA, metaB);
  const screenerComparison = compareScreeners(metaA, metaB);
  const outlierComparison = compareOutliers(metaA, metaB);
  const questionOverlapSummary = buildQuestionOverlapSummary(analysisA, analysisB);

  const summary = buildSummary({
    overviewComparison,
    scaleComparison,
    categoricalComparison,
    screenerComparison,
    questionOverlapSummary,
  });

  return {
    meta: {
      surveyName: meta.surveyName || null,
      waveALabel: meta.waveALabel || 'Wave A',
      waveBLabel: meta.waveBLabel || 'Wave B',
      studyType: meta.studyType || metaA.screener?.studyType || metaB.screener?.studyType || null,
      comparisonMode: questionOverlapSummary.comparisonMode,
    },
    overviewComparison,
    screenerComparison,
    timelineComparison,
    scaleComparison,
    categoricalComparison,
    outlierComparison,
    questionOverlapSummary,
    summary,
  };
}
