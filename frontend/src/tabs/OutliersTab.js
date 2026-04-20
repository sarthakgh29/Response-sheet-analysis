function splitOutliers(rows) {
  const globalRows = [];
  const localRows = [];
  const otherRows = [];

  rows.forEach((row) => {
    const type = String(row.outlierType || '').toUpperCase();
    if (type === 'GLOBAL_OL') globalRows.push(row);
    else if (type === 'LOCAL_OL') localRows.push(row);
    else otherRows.push(row);
  });

  return { globalRows, localRows, otherRows };
}

function renderMiniCard(row) {
  return `
    <div class="legacy-outlier-mini-card">
      <div class="legacy-outlier-mini-name">${row.firstName || ''} ${row.lastName || ''}</div>
      <div class="legacy-outlier-mini-meta">NPI: ${row.npi || '--'} | ID: ${row.id || '--'}</div>
    </div>
  `;
}

export function OutliersTab(sheetData) {
  const outliers = sheetData.analysis.meta.outlierRespondents || [];
  const { globalRows, localRows, otherRows } = splitOutliers(outliers);
  const globalAll = [...globalRows, ...otherRows.filter((row) => !String(row.outlierType || '').toUpperCase())];

  return `
    <section class="legacy-outliers-screen">
      <div class="legacy-outliers-heading">OUTLIER ANALYSIS -- ${outliers.length} flagged</div>

      <div class="legacy-outliers-two-col">
        <article class="legacy-outlier-big-box">
          <div class="legacy-outlier-box-title">GLOBAL_OL (${globalAll.length})</div>
          <div class="legacy-outlier-box-subtitle">Inconsistent answers across entire survey.</div>
          <div class="legacy-outlier-mini-grid">
            ${globalAll.length
              ? globalAll.map(renderMiniCard).join('')
              : '<div class="legacy-outlier-empty">No flagged respondents.</div>'}
          </div>
        </article>

        <article class="legacy-outlier-big-box">
          <div class="legacy-outlier-box-title">LOCAL_OL (${localRows.length})</div>
          <div class="legacy-outlier-box-subtitle">Flagged on specific question only.</div>
          <div class="legacy-outlier-mini-grid">
            ${localRows.length
              ? localRows.map(renderMiniCard).join('')
              : '<div class="legacy-outlier-empty">No flagged respondents.</div>'}
          </div>
        </article>
      </div>
    </section>
  `;
}