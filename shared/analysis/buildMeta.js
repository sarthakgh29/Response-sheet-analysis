export function buildMeta({ respondents, questions, scaleQs, catQs, overview, timeline, screener, enrichment }) {
  return {
    total: overview.total,
    completed: overview.completed,
    statuses: overview.statuses,
    outliers: overview.outliers,
    avgRating: overview.avgRating,
    outlierRespondents: respondents.filter((respondent) => respondent.outlierType && respondent.outlierType !== 'nan' && respondent.outlierType !== ''),
    timings: overview.timings,
    timeline,
    dateRange: {
      first: respondents.map((respondent) => respondent.startUTC).filter(Boolean).sort()[0] || null,
      last: respondents.map((respondent) => respondent.startUTC).filter(Boolean).sort().slice(-1)[0] || null,
    },
    stitched: respondents.filter((respondent) => respondent.isStitched === 'Yes').length,
    panelScreenerFailures: screener.psfLast,
    demographics: enrichment.demographics,
    repInteractions: enrichment.repInteractions,
    productAwareness: enrichment.productAwareness,
    attrConditions: enrichment.attrConditions,
    drugTreatment: enrichment.drugTreatment,
    screener,
    questionCounts: {
      total: questions.length,
      scale: scaleQs.length,
      categorical: catQs.length,
    },
  };
}
