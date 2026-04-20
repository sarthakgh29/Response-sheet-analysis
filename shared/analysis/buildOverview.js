import { mean, median } from '../utils/stats.js';

export function buildOverview({ respondents, completedRespondents, screener }) {
  const statuses = {};
  const outliers = {};
  const ratings = [];
  const times = [];

  respondents.forEach((respondent) => {
    if (respondent.status) statuses[respondent.status] = (statuses[respondent.status] || 0) + 1;
    if (respondent.outlierType && respondent.outlierType !== 'nan') outliers[respondent.outlierType] = (outliers[respondent.outlierType] || 0) + 1;
    if (respondent.userRating != null && respondent.userRating > 0) ratings.push(respondent.userRating);
    if (respondent.timeTakenMin != null && respondent.timeTakenMin > 0 && respondent.status === 'Completed') times.push(respondent.timeTakenMin);
  });

  const timingStats = times.length ? {
    min: Number(Math.min(...times).toFixed(1)),
    max: Number(Math.max(...times).toFixed(1)),
    mean: Number(mean(times).toFixed(1)),
    median: Number(median(times).toFixed(1)),
    speedsters: completedRespondents.filter((respondent) => respondent.timeTakenMin != null && respondent.timeTakenMin < 5),
    slow: completedRespondents.filter((respondent) => respondent.timeTakenMin != null && respondent.timeTakenMin > 60),
  } : null;

  return {
    total: respondents.length,
    completed: completedRespondents.length,
    partial: statuses.Partial || 0,
    panelFail: screener.psfCount,
    waveFail: screener.wsfCount,
    outliersCount: Object.values(outliers).reduce((acc, value) => acc + value, 0),
    avgRating: ratings.length ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : null,
    timings: timingStats,
    statuses,
    outliers,
  };
}
