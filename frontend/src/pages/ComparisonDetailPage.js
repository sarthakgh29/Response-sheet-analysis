import { Header } from '../components/layout/Header.js';
import { fetchComparisonById, askComparisonQuestion } from '../api/comparisonsApi.js';

function metricCard(label, metric, suffix = '') {
  const deltaClass = metric?.delta > 0 ? 'up' : metric?.delta < 0 ? 'down' : 'flat';
  const pctText = metric?.pctChange != null ? ` (${metric.pctChange}%)` : '';
  return `
    <article class="cmp-kpi-card">
      <div class="cmp-kpi-label">${label}</div>
      <div class="cmp-kpi-main">${metric?.waveA ?? '--'} <span>→</span> ${metric?.waveB ?? '--'}${suffix}</div>
      <div class="cmp-kpi-delta ${deltaClass}">Δ ${metric?.delta ?? '--'}${suffix}${pctText}</div>
    </article>
  `;
}

function renderOverview(comp) {
  const o = comp.overviewComparison;
  const bestUp = comp.scaleComparison?.biggestT2BIncrease;
  const bestDown = comp.scaleComparison?.biggestT2BDecline;

  return `
    <section class="cmp-pane-stack">
      <section class="cmp-kpi-grid">
        ${metricCard('Completed', o.completed)}
        ${metricCard('Avg Rating', o.avgRating)}
        ${metricCard('Median Time', o.medianTime, 'm')}
        ${metricCard('Outliers', o.outlierCount)}
        ${metricCard('Panel Fail', o.panelFail)}
        ${metricCard('Wave Fail', o.waveFail)}
      </section>

      <section class="cmp-two-col">
        <article class="cmp-card cmp-overview-card">
          <div class="cmp-card-title">Executive Summary</div>
          <div class="cmp-summary-grid">
            <div class="cmp-summary-row"><span>Total Respondents</span><strong>${o.totalRespondents.waveA} → ${o.totalRespondents.waveB}</strong></div>
            <div class="cmp-summary-row"><span>Completed</span><strong>${o.completed.waveA} → ${o.completed.waveB}</strong></div>
            <div class="cmp-summary-row"><span>Avg Rating</span><strong>${o.avgRating.waveA} → ${o.avgRating.waveB}</strong></div>
            <div class="cmp-summary-row"><span>Median Time</span><strong>${o.medianTime.waveA}m → ${o.medianTime.waveB}m</strong></div>
            <div class="cmp-summary-row"><span>Shared Scale Questions</span><strong>${comp.scaleComparison.totalSharedScaleQuestions}</strong></div>
            <div class="cmp-summary-row"><span>Shared Categorical Questions</span><strong>${comp.categoricalComparison.totalSharedCategoricalQuestions}</strong></div>
          </div>
        </article>

        <article class="cmp-card cmp-overview-card">
          <div class="cmp-card-title">Biggest Shifts</div>

          <div class="cmp-highlight-block">
            <div class="cmp-highlight-label">Top T2B Increase</div>
            ${bestUp ? `
              <div class="cmp-highlight-question">
                <span class="cmp-question-code">[${bestUp.code}]</span>
                <span class="cmp-question-copy">${bestUp.text}</span>
              </div>
              <div class="cmp-highlight-metric">Δ T2B: <strong>${bestUp.deltaT2B}</strong></div>
            ` : '<div class="cmp-empty">No scale shifts available.</div>'}
          </div>

          <div class="cmp-highlight-block">
            <div class="cmp-highlight-label">Largest T2B Decline</div>
            ${bestDown ? `
              <div class="cmp-highlight-question">
                <span class="cmp-question-code">[${bestDown.code}]</span>
                <span class="cmp-question-copy">${bestDown.text}</span>
              </div>
              <div class="cmp-highlight-metric">Δ T2B: <strong>${bestDown.deltaT2B}</strong></div>
            ` : '<div class="cmp-empty">No decline data available.</div>'}
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderScale(comp) {
  const rows = comp.scaleComparison?.rows || [];
  if (!rows.length) return '<div class="cmp-card"><div class="cmp-empty">No shared scale questions found.</div></div>';

  return `
    <section class="cmp-pane-stack">
      ${rows.map((row) => `
        <article class="cmp-card cmp-question-card">
          <div class="cmp-question-code">[${row.code}]</div>
          <div class="cmp-question-text"><strong>${row.text}</strong></div>
          <div class="cmp-scale-grid">
            <div class="cmp-wave-box">
              <div class="cmp-wave-label">Wave A</div>
              <div class="cmp-wave-line">Mean: <strong>${row.waveA.mean ?? '--'}</strong></div>
              <div class="cmp-wave-line">Median: <strong>${row.waveA.median ?? '--'}</strong></div>
              <div class="cmp-wave-line">T2B: <strong>${row.waveA.t2b ?? '--'}%</strong></div>
              <div class="cmp-wave-line">N: <strong>${row.waveA.n ?? '--'}</strong></div>
            </div>
            <div class="cmp-wave-box">
              <div class="cmp-wave-label">Wave B</div>
              <div class="cmp-wave-line">Mean: <strong>${row.waveB.mean ?? '--'}</strong></div>
              <div class="cmp-wave-line">Median: <strong>${row.waveB.median ?? '--'}</strong></div>
              <div class="cmp-wave-line">T2B: <strong>${row.waveB.t2b ?? '--'}%</strong></div>
              <div class="cmp-wave-line">N: <strong>${row.waveB.n ?? '--'}</strong></div>
            </div>
            <div class="cmp-delta-box">
              <div class="cmp-wave-label">Change</div>
              <div class="cmp-wave-line">Δ Mean: <strong>${row.deltaMean ?? '--'}</strong></div>
              <div class="cmp-wave-line">Δ T2B: <strong>${row.deltaT2B ?? '--'}</strong></div>
            </div>
          </div>
        </article>
      `).join('')}
    </section>
  `;
}

function renderCategorical(comp) {
  const rows = comp.categoricalComparison?.rows || [];
  if (!rows.length) return '<div class="cmp-card"><div class="cmp-empty">No shared categorical questions found.</div></div>';

  return `
    <section class="cmp-pane-stack">
      ${rows.slice(0, 18).map((row) => `
        <article class="cmp-card cmp-question-card">
          <div class="cmp-question-code">[${row.code}]</div>
          <div class="cmp-question-text"><strong>${row.text}</strong></div>
          <div class="cmp-option-stack">
            ${row.options.slice(0, 8).map((opt) => `
              <div class="cmp-option-card">
                <div class="cmp-option-head">
                  <div class="cmp-option-label">${opt.option}</div>
                  <div class="cmp-option-delta">Δ ${opt.delta_pct}</div>
                </div>
                <div class="cmp-option-bars">
                  <div class="cmp-option-bar-row">
                    <span>Wave A</span>
                    <div class="cmp-bar-track"><div class="cmp-bar-fill wave-a" style="width:${opt.waveA_pct}%"></div></div>
                    <strong>${opt.waveA_pct}%</strong>
                  </div>
                  <div class="cmp-option-bar-row">
                    <span>Wave B</span>
                    <div class="cmp-bar-track"><div class="cmp-bar-fill wave-b" style="width:${opt.waveB_pct}%"></div></div>
                    <strong>${opt.waveB_pct}%</strong>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </article>
      `).join('')}
    </section>
  `;
}

function buildLinePoints(rows, valueKey, width, height, padding) {
  const maxVal = Math.max(...rows.map((row) => row[valueKey] || 0), 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const stepX = rows.length > 1 ? innerWidth / (rows.length - 1) : innerWidth;

  return rows.map((row, index) => {
    const x = padding.left + stepX * index;
    const y = padding.top + innerHeight - (((row[valueKey] || 0) / maxVal) * innerHeight);
    return { x, y, value: row[valueKey] || 0 };
  });
}

function buildLineChartSvg(rows) {
  const width = Math.max(760, rows.length * 52);
  const height = 180;
  const padding = { top: 16, right: 18, bottom: 28, left: 18 };

  const pointsA = buildLinePoints(rows, 'waveA', width, height, padding);
  const pointsB = buildLinePoints(rows, 'waveB', width, height, padding);

  const polylineA = pointsA.map((p) => `${p.x},${p.y}`).join(' ');
  const polylineB = pointsB.map((p) => `${p.x},${p.y}`).join(' ');

  const maxVal = Math.max(...rows.flatMap((row) => [row.waveA || 0, row.waveB || 0]), 1);
  const gridLevels = 4;

  const gridLines = Array.from({ length: gridLevels + 1 }, (_, i) => {
    const ratio = i / gridLevels;
    const y = padding.top + ((height - padding.top - padding.bottom) * ratio);
    const label = Math.round(maxVal - (maxVal * ratio));
    return `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="cmp-line-grid" />
      <text x="${padding.left - 6}" y="${y + 3}" text-anchor="end" class="cmp-line-axis-text">${label}</text>
    `;
  }).join('');

  const dotsA = pointsA.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3.2" class="cmp-line-dot wave-a" />`).join('');
  const dotsB = pointsB.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3.2" class="cmp-line-dot wave-b" />`).join('');

  return `
    <div class="cmp-line-chart-wrap">
      <svg class="cmp-line-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        ${gridLines}
        <polyline points="${polylineA}" fill="none" class="cmp-line-path wave-a" />
        <polyline points="${polylineB}" fill="none" class="cmp-line-path wave-b" />
        ${dotsA}
        ${dotsB}
      </svg>

      <div class="cmp-line-axis-labels" style="width:${width}px;">
        ${rows.map((row) => `<div class="cmp-line-day-label">Day ${row.dayIndex}</div>`).join('')}
      </div>
    </div>
  `;
}

function renderTimeline(comp) {
  const rawRows = comp.timelineComparison?.rows || [];
  if (!rawRows.length) {
    return '<div class="cmp-card"><div class="cmp-empty">No timeline data found.</div></div>';
  }

  const rows = rawRows.map((row, index) => ({
    dayIndex: row.dayIndex || index + 1,
    waveA: row.waveA || 0,
    waveB: row.waveB || 0,
    waveADate: row.waveADate || null,
    waveBDate: row.waveBDate || null,
    delta: row.delta || 0,
  }));

  const totalWaveA = rows.reduce((sum, row) => sum + (row.waveA || 0), 0);
  const totalWaveB = rows.reduce((sum, row) => sum + (row.waveB || 0), 0);

  const peakA = rows.reduce((best, row) => ((row.waveA || 0) > (best.waveA || -1) ? row : best), rows[0]);
  const peakB = rows.reduce((best, row) => ((row.waveB || 0) > (best.waveB || -1) ? row : best), rows[0]);

  const waveAFieldingDays = comp.timelineComparison?.waveAFieldingDays ?? rows.filter((row) => (row.waveA || 0) > 0).length;
  const waveBFieldingDays = comp.timelineComparison?.waveBFieldingDays ?? rows.filter((row) => (row.waveB || 0) > 0).length;

  const waveAStartDate = comp.timelineComparison?.waveAStartDate || rows.find((row) => row.waveADate)?.waveADate || '--';
  const waveAEndDate = comp.timelineComparison?.waveAEndDate || [...rows].reverse().find((row) => row.waveADate)?.waveADate || '--';
  const waveBStartDate = comp.timelineComparison?.waveBStartDate || rows.find((row) => row.waveBDate)?.waveBDate || '--';
  const waveBEndDate = comp.timelineComparison?.waveBEndDate || [...rows].reverse().find((row) => row.waveBDate)?.waveBDate || '--';

  return `
    <section class="cmp-pane-stack">
      <article class="cmp-card cmp-timeline-main-card">
        <div class="cmp-card-title">Daily Completions by Relative Fielding Day</div>

        <div class="cmp-timeline-legend">
          <div class="cmp-legend-item">
            <span class="cmp-legend-dot wave-a"></span>
            <span>${comp.meta.waveALabel || 'Wave A'}</span>
          </div>
          <div class="cmp-legend-item">
            <span class="cmp-legend-dot wave-b"></span>
            <span>${comp.meta.waveBLabel || 'Wave B'}</span>
          </div>
        </div>

        <div class="cmp-timeline-scroll">
          ${buildLineChartSvg(rows)}
        </div>
      </article>

      <section class="cmp-two-col">
        <article class="cmp-card">
          <div class="cmp-card-title">Fielding Summary</div>
          <div class="cmp-summary-grid">
            <div class="cmp-summary-row"><span>${comp.meta.waveALabel || 'Wave A'} fielding window</span><strong>${waveAStartDate} → ${waveAEndDate}</strong></div>
            <div class="cmp-summary-row"><span>${comp.meta.waveBLabel || 'Wave B'} fielding window</span><strong>${waveBStartDate} → ${waveBEndDate}</strong></div>
            <div class="cmp-summary-row"><span>${comp.meta.waveALabel || 'Wave A'} total completions</span><strong>${totalWaveA}</strong></div>
            <div class="cmp-summary-row"><span>${comp.meta.waveBLabel || 'Wave B'} total completions</span><strong>${totalWaveB}</strong></div>
            <div class="cmp-summary-row"><span>${comp.meta.waveALabel || 'Wave A'} fielding days</span><strong>${waveAFieldingDays}</strong></div>
            <div class="cmp-summary-row"><span>${comp.meta.waveBLabel || 'Wave B'} fielding days</span><strong>${waveBFieldingDays}</strong></div>
          </div>
        </article>

        <article class="cmp-card">
          <div class="cmp-card-title">Completion Pattern</div>
          <div class="cmp-highlight-block">
            <div class="cmp-highlight-label">${comp.meta.waveALabel || 'Wave A'} peak fielding day</div>
            <div class="cmp-highlight-question">
              <span class="cmp-question-code">Day ${peakA?.dayIndex || '--'}</span>
              <span class="cmp-question-copy">${peakA?.waveADate || '--'}</span>
            </div>
            <div class="cmp-highlight-metric">Completions: <strong>${peakA?.waveA ?? '--'}</strong></div>
          </div>

          <div class="cmp-highlight-block">
            <div class="cmp-highlight-label">${comp.meta.waveBLabel || 'Wave B'} peak fielding day</div>
            <div class="cmp-highlight-question">
              <span class="cmp-question-code">Day ${peakB?.dayIndex || '--'}</span>
              <span class="cmp-question-copy">${peakB?.waveBDate || '--'}</span>
            </div>
            <div class="cmp-highlight-metric">Completions: <strong>${peakB?.waveB ?? '--'}</strong></div>
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderQuestionOverlap(comp) {
  const q = comp.questionOverlapSummary || {};
  const removedPct = q.totalUniqueQuestions ? Number(((q.onlyInWaveACount / q.totalUniqueQuestions) * 100).toFixed(1)) : 0;
  const addedPct = q.totalUniqueQuestions ? Number(((q.onlyInWaveBCount / q.totalUniqueQuestions) * 100).toFixed(1)) : 0;
  const modeLabel = q.comparisonMode === 'full' ? 'Full comparison mode' : 'Questions-only mode';

  const renderQuestionList = (title, subtitle, rows = [], emptyText) => `
    <article class="cmp-card cmp-question-list-card">
      <div class="cmp-card-title">${title}</div>
      <div class="cmp-question-list-subtitle">${subtitle}</div>
      ${rows.length ? `
        <div class="cmp-question-list-scroll">
          ${rows.map((row) => `
            <div class="cmp-question-list-item">
              <div class="cmp-question-code">[${row.code}]</div>
              <div class="cmp-question-copy">${row.text}</div>
            </div>
          `).join('')}
        </div>
      ` : `<div class="cmp-empty">${emptyText}</div>`}
    </article>
  `;

  return `
    <section class="cmp-pane-stack">
      <section class="cmp-overlap-summary-grid">
        <article class="cmp-card cmp-overlap-metric-card">
          <div class="cmp-card-title">Question Overlap</div>
          <div class="cmp-overlap-big">${q.overlapPct ?? 0}%</div>
          <div class="cmp-overlap-note">${q.sharedQuestionCount || 0} of ${q.totalUniqueQuestions || 0} unique analyzable questions are shared across both waves.</div>
        </article>
        <article class="cmp-card cmp-overlap-metric-card">
          <div class="cmp-card-title">Comparison Availability</div>
          <div class="cmp-overlap-pill ${q.comparisonMode === 'full' ? 'full' : 'limited'}">${modeLabel}</div>
          <div class="cmp-overlap-note">${q.comparisonMode === 'full' ? 'Other tabs remain available because overlap is at least 50%.' : 'Other tabs are hidden because overlap is below 50%.'}</div>
        </article>
        <article class="cmp-card cmp-overlap-metric-card">
          <div class="cmp-card-title">Same Questions</div>
          <div class="cmp-overlap-big">${q.sharedQuestionCount || 0}</div>
          <div class="cmp-overlap-note">${q.samePct ?? 0}% of the combined question universe is shared between ${comp.meta.waveALabel} and ${comp.meta.waveBLabel}.</div>
        </article>
        <article class="cmp-card cmp-overlap-metric-card">
          <div class="cmp-card-title">Changed Question Set</div>
          <div class="cmp-overlap-big">${(q.onlyInWaveACount || 0) + (q.onlyInWaveBCount || 0)}</div>
          <div class="cmp-overlap-note">${q.differentPct ?? 0}% of the combined question universe differs between the two waves.</div>
        </article>
      </section>

      <section class="cmp-two-col cmp-question-list-grid">
        <article class="cmp-card">
          <div class="cmp-card-title">Question Set Summary</div>
          <div class="cmp-summary-grid">
            <div class="cmp-summary-row"><span>${comp.meta.waveALabel} analyzable questions</span><strong>${q.totalWaveAQuestions || 0}</strong></div>
            <div class="cmp-summary-row"><span>${comp.meta.waveBLabel} analyzable questions</span><strong>${q.totalWaveBQuestions || 0}</strong></div>
            <div class="cmp-summary-row"><span>Same in both waves</span><strong>${q.sharedQuestionCount || 0} (${q.samePct ?? 0}%)</strong></div>
            <div class="cmp-summary-row"><span>Present only in ${comp.meta.waveALabel}</span><strong>${q.onlyInWaveACount || 0} (${removedPct}%)</strong></div>
            <div class="cmp-summary-row"><span>Present only in ${comp.meta.waveBLabel}</span><strong>${q.onlyInWaveBCount || 0} (${addedPct}%)</strong></div>
            <div class="cmp-summary-row"><span>Total unique questions across both waves</span><strong>${q.totalUniqueQuestions || 0}</strong></div>
          </div>
        </article>

        <article class="cmp-card">
          <div class="cmp-card-title">Interpretation</div>
          <div class="cmp-highlight-block">
            <div class="cmp-highlight-label">What this means</div>
            <div class="cmp-highlight-question">
              <span class="cmp-question-copy">Use this tab to understand how much of the questionnaire stayed the same versus what changed from ${comp.meta.waveALabel} to ${comp.meta.waveBLabel}. When overlap drops below 50%, the comparison page switches to questions-only mode so the app does not overstate findings from weakly comparable surveys.</span>
            </div>
          </div>
        </article>
      </section>

      <section class="cmp-two-col cmp-question-list-grid">
        ${renderQuestionList(
          'Same as last wave',
          `${q.sharedQuestionCount || 0} shared questions (${q.samePct ?? 0}%)`,
          q.sharedQuestions || [],
          'No shared questions found.'
        )}
        ${renderQuestionList(
          `Different from ${comp.meta.waveALabel}`,
          `Questions present in ${comp.meta.waveALabel} but not in ${comp.meta.waveBLabel}`,
          q.onlyInWaveA || [],
          `No questions were removed from ${comp.meta.waveALabel}.`
        )}
      </section>

      <section class="cmp-question-list-grid cmp-single-list-grid">
        ${renderQuestionList(
          `New in ${comp.meta.waveBLabel}`,
          `Questions present in ${comp.meta.waveBLabel} but not in ${comp.meta.waveALabel}`,
          q.onlyInWaveB || [],
          `No new questions were added in ${comp.meta.waveBLabel}.`
        )}
      </section>
    </section>
  `;
}

function renderChat(messages, comp) {
  const suggestions = [
    `What improved most from ${comp.meta.waveALabel} to ${comp.meta.waveBLabel}?`,
    'Which scale questions had the biggest positive movement?',
    'Which categorical shifts stand out most?',
    'How did fielding patterns differ between the two waves?',
    'Give me an executive summary of the comparison.',
  ];

  return `
    <article class="legacy-chat-card">
      <div class="legacy-chat-title">Comparison Chat</div>

      <div class="legacy-suggestions">
        ${suggestions.map((query) => `
          <button class="legacy-suggestion-btn cmp-suggested-btn" data-cmp-question="${query}">
            ${query}
          </button>
        `).join('')}
      </div>

      <div id="cmp-chat-messages" class="legacy-chat-messages">
        ${messages.length
          ? messages.map((msg) => `
              <div class="chat-bubble ${msg.role}">
                ${msg.content}
              </div>
            `).join('')
          : ''}
      </div>

      <form id="cmp-chat-form" class="legacy-chat-form">
        <input id="cmp-chat-input" placeholder="Ask about differences between the two waves..." />
        <button type="submit" class="legacy-send-btn">Send</button>
      </form>
    </article>
  `;
}

const panes = {
  overview: renderOverview,
  scale: renderScale,
  categorical: renderCategorical,
  timeline: renderTimeline,
  questions: renderQuestionOverlap,
};

function getComparisonTabs(comp) {
  if ((comp.questionOverlapSummary?.comparisonMode || 'full') === 'questions-only') {
    return [['questions', 'Question Changes']];
  }

  return [
    ['overview', 'Overview'],
    ['scale', 'Scale'],
    ['categorical', 'Categorical'],
    ['timeline', 'Timeline'],
    ['chat', 'Chat'],
    ['questions', 'Question Changes'],
  ];
}

function comparisonTabs(active, comp) {
  const tabs = getComparisonTabs(comp);

  return `
    <div class="cmp-tab-row">
      ${tabs.map(([key, label]) => `
        <button class="cmp-tab-btn ${active === key ? 'active' : ''}" data-cmp-tab="${key}">${label}</button>
      `).join('')}
    </div>
  `;
}

export async function renderComparisonDetailPage(root, comparisonSetId) {
  root.innerHTML = `${Header('comparisons')}<main class="legacy-page-shell"><section class="legacy-page-card">Loading comparison...</section></main>`;

  const data = await fetchComparisonById(comparisonSetId);
  const comparison = data.comparison;
  const comp = data.comparisonJson;

  let activeTab = (comp.questionOverlapSummary?.comparisonMode || 'full') === 'questions-only' ? 'questions' : 'overview';
  const chatMessages = [];

  function paneHtml() {
    if (activeTab === 'chat') {
      return renderChat(chatMessages, comp);
    }
    return (panes[activeTab] || renderOverview)(comp);
  }

  function bindTabEvents() {
    root.querySelectorAll('[data-cmp-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.cmpTab;
        draw();
      });
    });
  }

  function bindChatEvents() {
    if (activeTab !== 'chat') return;

    root.querySelectorAll('.cmp-suggested-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        await sendChatMessage(button.dataset.cmpQuestion);
      });
    });

    const form = root.querySelector('#cmp-chat-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = root.querySelector('#cmp-chat-input');
      const message = input.value.trim();
      if (!message) return;
      input.value = '';
      await sendChatMessage(message);
    });
  }

  async function sendChatMessage(text) {
    const message = String(text || '').trim();
    if (!message) return;

    chatMessages.push({ role: 'user', content: message });
    draw();

    const history = chatMessages.slice(0, -1).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    try {
      const reply = await askComparisonQuestion(comparison.comparisonSetId, message, history);
      chatMessages.push({
        role: reply.role || 'assistant',
        content: reply.content || 'No response generated.',
      });
    } catch (error) {
      chatMessages.push({ role: 'assistant', content: `Error: ${error.message}` });
    }

    draw();
  }

  function draw() {
    root.innerHTML = `
      ${Header('comparisons')}
      <main class="legacy-page-shell cmp-shell">
        <section class="legacy-page-card cmp-page-card">
          <div class="cmp-hero">
            <div>
              <div class="legacy-card-kicker">Comparison #${comparison.comparisonNo}</div>
              <h2 class="legacy-card-title">${comparison.surveyName || 'Wave Comparison'}</h2>
              <div class="cmp-hero-sub">${comparison.waveALabel} (Sheet #${comparison.sheetANo}) vs ${comparison.waveBLabel} (Sheet #${comparison.sheetBNo})</div>
            </div>
            <div class="cmp-pill-group">
              <span class="cmp-info-pill">${comparison.studyType || '--'}</span>
              <span class="cmp-info-pill">Created ${new Date(comparison.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <section class="cmp-wave-summary-grid">
            <article class="cmp-wave-summary-card">
              <div class="cmp-wave-summary-label">${comparison.waveALabel}</div>
              <div class="cmp-wave-summary-sheet">Sheet #${comparison.sheetANo}</div>
              <div class="cmp-wave-summary-stats">Completed: <strong>${comp.overviewComparison.completed.waveA}</strong></div>
              <div class="cmp-wave-summary-stats">Avg Rating: <strong>${comp.overviewComparison.avgRating.waveA}</strong></div>
              <div class="cmp-wave-summary-stats">Median Time: <strong>${comp.overviewComparison.medianTime.waveA}m</strong></div>
            </article>
            <article class="cmp-wave-summary-card">
              <div class="cmp-wave-summary-label">${comparison.waveBLabel}</div>
              <div class="cmp-wave-summary-sheet">Sheet #${comparison.sheetBNo}</div>
              <div class="cmp-wave-summary-stats">Completed: <strong>${comp.overviewComparison.completed.waveB}</strong></div>
              <div class="cmp-wave-summary-stats">Avg Rating: <strong>${comp.overviewComparison.avgRating.waveB}</strong></div>
              <div class="cmp-wave-summary-stats">Median Time: <strong>${comp.overviewComparison.medianTime.waveB}m</strong></div>
            </article>
          </section>

          ${comparisonTabs(activeTab, comp)}
          <section id="cmp-pane">${paneHtml()}</section>
        </section>
      </main>
    `;

    bindTabEvents();
    bindChatEvents();
  }

  draw();
}
