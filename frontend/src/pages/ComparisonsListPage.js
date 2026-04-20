import { Header } from '../components/layout/Header.js';
import { fetchComparisons, deleteComparisonById } from '../api/comparisonsApi.js';

function formatDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString();
}

export async function renderComparisonsListPage(root) {
  root.innerHTML = `${Header('comparisons')}<main class="legacy-page-shell"><section class="legacy-page-card">Loading comparisons...</section></main>`;

  async function draw() {
    const comparisons = await fetchComparisons();

    root.innerHTML = `
      ${Header('comparisons')}
      <main class="legacy-page-shell">
        <section class="legacy-page-card">
          <div class="legacy-page-card-head">
            <div>
              <div class="legacy-card-kicker">Wave Comparisons</div>
              <h2 class="legacy-card-title">Saved comparisons</h2>
            </div>
            <a href="#/upload" class="legacy-mini-pill solid">UPLOAD</a>
          </div>

          <div class="legacy-table-wrap">
            <table class="legacy-table">
              <thead>
                <tr>
                  <th style="width:84px;">Cmp No</th>
                  <th>Survey</th>
                  <th>Wave A</th>
                  <th>Wave B</th>
                  <th style="width:84px;">Sheet A</th>
                  <th style="width:84px;">Sheet B</th>
                  <th>Study Type</th>
                  <th>Created</th>
                  <th style="width:110px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${comparisons.length ? comparisons.map((comparison) => `
                  <tr>
                    <td><a class="legacy-link" href="#/comparisons/${comparison.comparisonSetId}">#${comparison.comparisonNo}</a></td>
                    <td>${comparison.surveyName || '--'}</td>
                    <td>${comparison.waveALabel || '--'}</td>
                    <td>${comparison.waveBLabel || '--'}</td>
                    <td>${comparison.sheetANo || '--'}</td>
                    <td>${comparison.sheetBNo || '--'}</td>
                    <td>${comparison.studyType || '--'}</td>
                    <td>${formatDate(comparison.createdAt)}</td>
                    <td>
                      <button class="legacy-delete-btn" data-delete-comparison="${comparison.comparisonSetId}" data-comparison-no="${comparison.comparisonNo}">Delete</button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="9"><div class="legacy-empty-state">No saved comparisons yet.</div></td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    `;

    root.querySelectorAll('[data-delete-comparison]').forEach((button) => {
      button.addEventListener('click', async () => {
        const comparisonSetId = button.dataset.deleteComparison;
        const comparisonNo = button.dataset.comparisonNo;
        const ok = window.confirm(`Delete comparison #${comparisonNo}? This removes only the comparison record, not the uploaded sheets.`);
        if (!ok) return;

        try {
          await deleteComparisonById(comparisonSetId);
          await draw();
        } catch (error) {
          alert(error.message);
        }
      });
    });
  }

  await draw();
}
