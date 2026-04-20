export function TimelineChart(timeline) {
  if (!timeline?.length) return '<div class="panel-card">No timeline data.</div>';
  const max = Math.max(...timeline.map((row) => row.count || row.completionsCount || 0), 1);
  return `<div class="timeline-bars">${timeline.map((row) => { const count = row.count ?? row.completionsCount; const height = Math.max(10, Math.round((count / max) * 180)); return `<div class="timeline-col" title="${row.date}: ${count}"><div class="timeline-count">${count}</div><div class="timeline-bar" style="height:${height}px"></div><div class="timeline-date">${String(row.date).slice(5, 10)}</div></div>`; }).join('')}</div>`;
}
