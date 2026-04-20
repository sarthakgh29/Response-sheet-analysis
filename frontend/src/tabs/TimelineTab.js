function renderDailyBars(timeline = []) {
  if (!timeline.length) {
    return '<div class="legacy-timeline-empty">No timeline data available.</div>';
  }

  const maxCount = Math.max(...timeline.map((row) => Number(row.count || row.completionsCount || 0)), 1);

  return timeline
    .map((row) => {
      const count = Number(row.count || row.completionsCount || 0);
      const date = String(row.date || '');
      const shortDate = date.length >= 5 ? date.slice(5) : date;
      const height = Math.max(8, Math.round((count / maxCount) * 78));

      return `
        <div class="legacy-timeline-bar-col" title="${date}: ${count}">
          <div class="legacy-timeline-bar-count">${count}</div>
          <div class="legacy-timeline-bar-wrap">
            <div class="legacy-timeline-bar-fill" style="height:${height}px"></div>
          </div>
          <div class="legacy-timeline-bar-date">${shortDate}</div>
        </div>
      `;
    })
    .join('');
}

function renderStatusRows(statuses = {}) {
  const entries = Object.entries(statuses).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    return '<div class="legacy-timeline-empty">No status data available.</div>';
  }

  const total = entries.reduce((sum, [, count]) => sum + Number(count || 0), 0) || 1;

  return entries
    .map(([label, count]) => {
      const pct = ((Number(count || 0) / total) * 100).toFixed(1);

      return `
        <div class="legacy-status-row">
          <div class="legacy-status-label">${label}</div>
          <div class="legacy-status-right">
            <div class="legacy-status-track">
              <div class="legacy-status-fill" style="width:${pct}%"></div>
            </div>
            <div class="legacy-status-value">${count} (${pct}%)</div>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderTimingRows(timings) {
  if (!timings) {
    return '<div class="legacy-timeline-empty">No completion time data available.</div>';
  }

  const rows = [
    ['Fastest', `${timings.min}m`],
    ['Median', `${timings.median}m`],
    ['Average', `${timings.mean}m`],
    ['Slowest', `${timings.max}m`],
    ['Speedsters (<5m)', `${(timings.speedsters || []).length}`],
    ['Slow (>60m)', `${(timings.slow || []).length}`],
  ];

  return rows
    .map(
      ([label, value]) => `
        <div class="legacy-timing-row">
          <div class="legacy-timing-label">${label}</div>
          <div class="legacy-timing-value">${value}</div>
        </div>
      `
    )
    .join('');
}

export function TimelineTab(sheetData) {
  const meta = sheetData.analysis.meta || {};
  const timeline = meta.timeline || [];

  return `
    <section class="legacy-timeline-screen">
      <div class="legacy-section-heading">FIELD TIMELINE</div>

      <article class="legacy-timeline-top-box">
        <div class="legacy-timeline-box-title">DAILY COMPLETIONS</div>
        <div class="legacy-timeline-chart-scroll">
          <div class="legacy-timeline-chart-inner">
            ${renderDailyBars(timeline)}
          </div>
        </div>
      </article>

      <div class="legacy-timeline-bottom-grid">
        <article class="legacy-timeline-bottom-box">
          <div class="legacy-timeline-box-title">STATUS BREAKDOWN</div>
          <div class="legacy-status-stack">
            ${renderStatusRows(meta.statuses || {})}
          </div>
        </article>

        <article class="legacy-timeline-bottom-box">
          <div class="legacy-timeline-box-title">COMPLETION TIMES</div>
          <div class="legacy-timing-stack">
            ${renderTimingRows(meta.timings)}
          </div>
        </article>
      </div>

      <button class="legacy-timeline-report-btn">AI Timeline Report -></button>
    </section>
  `;
}