function formatValue(value) {
  if (value == null || Number.isNaN(value)) return '--';
  return String(value);
}

export function Sidebar(meta) {
  const outlierCounts = meta.outliers || {};
  const outlierTotal = Object.values(outlierCounts).reduce((a, b) => a + b, 0);

  const cards = [
    {
      label: 'Completed',
      value: meta.completed,
      helper: meta.total ? `${((meta.completed / meta.total) * 100).toFixed(1)}% of ${meta.total}` : '--',
    },
    {
      label: 'Partial',
      value: meta.statuses?.Partial || 0,
      helper: meta.total ? `${(((meta.statuses?.Partial || 0) / meta.total) * 100).toFixed(1)}%` : '--',
    },
    {
      label: 'Panel Fail',
      value: meta.screener?.psfCount || 0,
      helper: 'HCP qualification',
    },
    {
      label: 'Wave Fail',
      value: meta.screener?.wsfCount || 0,
      helper: 'eligibility failure',
    },
    {
      label: 'Outliers',
      value: outlierTotal,
      helper: Object.keys(outlierCounts).length ? Object.keys(outlierCounts).join(', ') : 'none',
    },
    {
      label: 'Avg Rating',
      value: meta.avgRating != null ? `${meta.avgRating}/5` : '--',
      helper: 'panel quality',
    },
    {
      label: 'Median Time',
      value: meta.timings?.median ? `${meta.timings.median}m` : '--',
      helper: meta.timings ? `${meta.timings.min}-${meta.timings.max}m` : 'no timing data',
    },
  ];

  return `
    <aside class="legacy-sidebar">
      <div class="legacy-sidebar-title">FIELD HEALTH</div>
      ${cards.map((card) => `
        <section class="legacy-kpi-card">
          <div class="legacy-kpi-label">${card.label}</div>
          <div class="legacy-kpi-value">${formatValue(card.value)}</div>
          <div class="legacy-kpi-helper">${card.helper}</div>
        </section>
      `).join('')}
    </aside>
  `;
}
