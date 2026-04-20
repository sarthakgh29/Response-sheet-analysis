import { normalizeDateKey } from '../utils/dates.js';

export function buildTimeline(completedRespondents) {
  const byDate = {};
  completedRespondents.forEach((respondent) => {
    if (!respondent.endUTC) return;
    const dateKey = normalizeDateKey(respondent.endUTC);
    if (!dateKey) return;
    byDate[dateKey] = (byDate[dateKey] || 0) + 1;
  });

  return Object.entries(byDate)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));
}
