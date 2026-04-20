export function OverviewTab(sheetData) {
  const meta = sheetData.analysis.meta;

  return `
    <section class="legacy-overview-stack">
      <div class="legacy-summary-box">
        <div class="legacy-summary-title">LimeSurvey File Parsed</div>
        <div class="legacy-summary-line">${meta.completed} completed – ${meta.total} total respondents</div>
        <div class="legacy-summary-line">${sheetData.analysis.scaleQs?.length || 0} scale Qs – ${sheetData.analysis.catQs?.length || 0} categorical Qs</div>
        ${meta.dateRange?.first ? `<div class="legacy-summary-line">Field: ${String(meta.dateRange.first).slice(0, 10)} to ${String(meta.dateRange.last).slice(0, 10)}</div>` : ''}
      </div>
    </section>
  `;
}