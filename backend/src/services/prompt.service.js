function short(text, max = 140) {
  if (!text) return '';
  const value = String(text);
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function topEntries(obj = {}, limit = 8) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => `${key}: ${value}`);
}

export function buildSurveySystemPrompt(analysis, fileName) {
  const meta = analysis?.meta || {};
  const screener = meta?.screener || {};
  const scaleQs = analysis?.scaleQs || [];
  const catQs = analysis?.catQs || [];

  const summary = {
    fileName,
    overview: {
      totalRespondents: meta.total,
      completed: meta.completed,
      partial: meta.statuses?.Partial || 0,
      panelFail: screener.psfCount || 0,
      waveFail: screener.wsfCount || 0,
      avgRating: meta.avgRating,
      timings: meta.timings
        ? {
            min: meta.timings.min,
            max: meta.timings.max,
            mean: meta.timings.mean,
            median: meta.timings.median,
          }
        : null,
      studyType: screener.studyType || 'Unknown',
    },
    screener: {
      totalOut: screener.totalOut || 0,
      primaryOverall: screener.primDO
        ? {
            question: short(screener.primDO.qText, 180),
            count: screener.primDO.count,
            pct: screener.primDO.pct,
          }
        : null,
      primaryPanel: screener.primPSF
        ? {
            question: short(screener.primPSF.qText, 180),
            count: screener.primPSF.screenTypes?.Panel || 0,
          }
        : null,
      primaryWave: screener.primWSF
        ? {
            question: short(screener.primWSF.qText, 180),
            count: screener.primWSF.screenTypes?.Wave || 0,
          }
        : null,
      topDropoffs: (screener.doRanked || []).slice(0, 10).map((item) => ({
        question: short(item.qText, 180),
        count: item.count,
        pct: item.pct,
        panel: item.screenTypes?.Panel || 0,
        wave: item.screenTypes?.Wave || 0,
      })),
    },
    outliers: {
      counts: meta.outliers || {},
      total: Object.values(meta.outliers || {}).reduce((a, b) => a + b, 0),
    },
    timeline: (meta.timeline || []).slice(0, 50),
    demographics: {
      specialty: topEntries(meta.demographics?.specialty || {}, 8),
      hcpType: topEntries(meta.demographics?.hcpType || {}, 6),
      state: topEntries(meta.demographics?.state || {}, 8),
      yearsInPractice: topEntries(meta.demographics?.yearsInPractice || {}, 6),
    },
    scaleQuestions: scaleQs.slice(0, 60).map((q) => ({
      code: q.code,
      question: short(q.text, 180),
      mean: q.stats?.mean,
      median: q.stats?.median,
      t2b: q.stats?.top2box,
      n: q.n,
    })),
    categoricalQuestions: catQs.slice(0, 60).map((q) => ({
      code: q.code,
      question: short(q.text, 180),
      n: q.n,
      topAnswers: Object.entries(q.catStats?.pct || {}).slice(0, 8),
    })),
  };

  return [
    'You are a senior pharma market research analyst.',
    'Answer only using the provided survey analysis.',
    'Be concise, structured, and numerically precise.',
    'If data is missing, say that clearly.',
    'Reference question codes when useful.',
    '',
    'SURVEY ANALYSIS SUMMARY:',
    JSON.stringify(summary, null, 2),
  ].join('\n');
}