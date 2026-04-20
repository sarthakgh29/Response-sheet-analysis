function distributionChips(distribution = {}) {
  return Object.entries(distribution)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([value, count]) => `
      <span class="legacy-scale-chip">${value}: ${count}</span>
    `)
    .join('');
}

export function ScaleTab(sheetData) {
  const questions = sheetData.analysis.scaleQs || [];

  if (!questions.length) {
    return '<section class="legacy-content-card"><div class="legacy-empty-state">No scale questions detected.</div></section>';
  }

  return `
    <section class="legacy-scale-screen">
      <div class="legacy-scale-count">SCALE QUESTIONS -- ${questions.length}</div>

      <div class="legacy-scale-info-box">
        <strong>T2B (Top 2 Box):</strong>
        The percentage of respondents who selected one of the two highest options on the rating scale (e.g. 6 or 7 on a 7-point scale, or 9 or 10 on a 10-point scale). It is a standard pharma research metric — a high T2B means the promotional material strongly resonated.
      </div>

      <div class="legacy-scale-card-stack">
        ${questions.map((question) => `
          <article class="legacy-scale-question-card">
            <div class="legacy-scale-card-head">
              <div class="legacy-scale-question-text">
                <strong>[${question.code}] ${question.text}</strong>
              </div>
              <div class="legacy-scale-t2b-box">T2B ${question.stats?.top2box ?? '--'}%</div>
            </div>

            <div class="legacy-scale-chip-row">
              ${distributionChips(question.stats?.distribution || {})}
            </div>

            <div class="legacy-scale-n-line">N=${question.n}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}