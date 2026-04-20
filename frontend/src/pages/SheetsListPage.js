import { fetchSheets, deleteSheet } from '../api/sheetsApi.js';
import { Header } from '../components/layout/Header.js';
import { formatDate } from '../utils/formatters.js';

async function loadAndRender(root) {
  root.innerHTML = `${Header('sheets')}<main class="legacy-page-shell"><section class="legacy-page-card">Loading sheets...</section></main>`;
  const sheets = await fetchSheets();

  root.innerHTML = `
    ${Header('sheets')}
    <main class="legacy-page-shell">
      <section class="legacy-page-card">
        <div class="legacy-page-card-head">
          <div>
            <div class="legacy-card-kicker">Response Sheets</div>
            <h2 class="legacy-card-title">Stored uploads</h2>
          </div>
          <a href="#/upload" class="legacy-mini-pill solid">NEW</a>
        </div>
        <div class="legacy-table-wrap">
          <table class="legacy-table">
            <thead>
              <tr>
                <th style="width: 84px;">Sheet No</th>
                <th>File</th>
                <th>Study Type</th>
                <th>Uploaded</th>
                <th>Total</th>
                <th>Completed</th>
                <th style="width: 90px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${sheets.map((sheet) => `
                <tr>
                  <td><span class="legacy-sheet-no">#${sheet.sheetNo ?? '--'}</span></td>
                  <td><a class="legacy-link" href="#/sheets/${sheet.sheetId}">${sheet.fileName}</a></td>
                  <td>${sheet.studyType || '--'}</td>
                  <td>${formatDate(sheet.uploadedAt)}</td>
                  <td>${sheet.totalRespondents ?? '--'}</td>
                  <td>${sheet.completed ?? '--'}</td>
                  <td>
                    <button
                      class="legacy-delete-btn"
                      data-sheet-id="${sheet.sheetId}"
                      data-file-name="${String(sheet.fileName).replace(/"/g, '&quot;')}"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `;

  root.querySelectorAll('.legacy-delete-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const sheetId = button.dataset.sheetId;
      const fileName = button.dataset.fileName;
      const confirmed = window.confirm(`Delete "${fileName}" permanently?`);
      if (!confirmed) return;

      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = 'Deleting...';

      try {
        await deleteSheet(sheetId);
        await loadAndRender(root);
      } catch (error) {
        alert(error.message);
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });
}

export async function renderSheetsListPage(root) {
  await loadAndRender(root);
}
