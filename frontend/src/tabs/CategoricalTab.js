function isDerivedOrLogicQuestion(code, text) {
  const c = String(code || '').trim();
  const t = String(text || '').trim();

  if (!c || !t) return true;

  // Remove equation / derived fields like EQ_MD, EQ_NPPA, etc.
  if (/^EQ_/i.test(c)) return true;

  // Remove LimeSurvey logic text like {if(...)}
  if (/^\{if\s*\(/i.test(t)) return true;

  // Remove other expression-style fields
  if (/^\{.*\}$/i.test(t) && /(if\s*\(|==|!=|\|\||&&)/i.test(t)) return true;
  if (/[{}]/.test(t) && /(if\s*\(|==|!=|\|\||&&)/i.test(t)) return true;

  return false;
}

function optionCards(question) {
  const counts = question.catStats?.counts || {};
  const percentages = question.catStats?.pct || {};

  const ordered = Object.entries(percentages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  return ordered
    .map(([option, pct]) => {
      const count = counts[option] ?? 0;
      return `
        <div class="legacy-categorical-option-card">
          <div class="legacy-categorical-option-top">
            <div class="legacy-categorical-option-label">${option}</div>
            <div class="legacy-categorical-option-metrics">
              <span class="legacy-categorical-count-box">${count}</span>
              <span class="legacy-categorical-pct-box">${pct}%</span>
            </div>
          </div>
          <div class="legacy-categorical-bar-track">
            <div class="legacy-categorical-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    })
    .join('');
}

export function CategoricalTab(sheetData) {
  const questions = (sheetData.analysis.catQs || []).filter(
    (question) => !isDerivedOrLogicQuestion(question.code, question.text)
  );

  if (!questions.length) {
    return '<section class="legacy-content-card"><div class="legacy-empty-state">No categorical questions detected.</div></section>';
  }

  return `
    <section class="legacy-categorical-screen">
      <div class="legacy-section-heading">CATEGORICAL QUESTIONS -- ${questions.length}</div>

      <div class="legacy-categorical-card-stack">
        ${questions.map((question) => `
          <article class="legacy-categorical-question-card">
            <div class="legacy-categorical-question-code">[${question.code}]</div>
            <div class="legacy-categorical-question-text"><strong>${question.text}</strong></div>
            <div class="legacy-categorical-n-line">N=${question.n}</div>
            <div class="legacy-categorical-option-stack">
              ${optionCards(question)}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}