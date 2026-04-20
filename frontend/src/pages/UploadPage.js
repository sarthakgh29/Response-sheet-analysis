import { Header } from '../components/layout/Header.js';
import { uploadSheet } from '../api/sheetsApi.js';
import { uploadComparisonFiles } from '../api/comparisonsApi.js';

function bindFilePicker(root, buttonId, inputId, nameId, emptyText = 'No file chosen') {
  const button = root.querySelector(buttonId);
  const input = root.querySelector(inputId);
  const name = root.querySelector(nameId);
  if (!button || !input || !name) return;

  button.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    name.textContent = input.files?.[0]?.name || emptyText;
  });
}

export async function renderUploadPage(root) {
  root.innerHTML = `
    ${Header('upload')}
    <main class="legacy-upload-page">
      <section class="legacy-upload-block">
        <div class="legacy-upload-intro">
          <div class="legacy-upload-kicker">Survey Insights</div>
          <h1>Upload response sheet</h1>
          <p>Upload one response sheet, or compare two waves of the same survey.</p>
        </div>

        <div class="legacy-upload-mode-toggle">
          <button id="mode-single" class="legacy-upload-mode-btn active">Single Sheet</button>
          <button id="mode-compare" class="legacy-upload-mode-btn">Compare Two Waves</button>
        </div>

        <section id="single-upload-card" class="upload-card">
          <div class="upload-icon">CSV</div>
          <h2>Single sheet upload</h2>
          <p>Upload one LimeSurvey response sheet.</p>

          <input id="single-file-input" class="legacy-hidden-file-input" type="file" accept=".csv" hidden style="display:none !important; position:absolute; left:-9999px; width:1px; height:1px; opacity:0;"/>
          <div class="legacy-file-picker-center-row">
            <button id="single-file-btn" type="button" class="legacy-file-picker-btn">Choose File</button>
            <span id="single-file-name" class="legacy-file-name-text">No file chosen</span>
          </div>

          <div class="legacy-upload-action-row">
            <button id="single-upload-btn" class="primary-btn">Upload</button>
          </div>
        </section>

        <section id="compare-upload-card" class="upload-card" style="display:none;">
          <div class="upload-icon">2X</div>
          <h2>Wave comparison upload</h2>
          <p>Upload two response sheets from the same survey but different waves.</p>

          <div class="legacy-form-stack">
            <input id="survey-name" placeholder="Survey name (optional)" />
            <input id="wave-a-label" placeholder="Wave A label (e.g. Wave 1)" />

            <input id="wave-a-file" class="legacy-hidden-file-input" type="file" accept=".csv" hidden style="display:none !important; position:absolute; left:-9999px; width:1px; height:1px; opacity:0;"/>
            <div class="legacy-file-picker-center-row">
              <button id="wave-a-btn" type="button" class="legacy-file-picker-btn">Choose Wave A</button>
              <span id="wave-a-name" class="legacy-file-name-text">No file chosen</span>
            </div>

            <input id="wave-b-label" placeholder="Wave B label (e.g. Wave 2)" />

            <input id="wave-b-file" class="legacy-hidden-file-input" type="file" accept=".csv" hidden style="display:none !important; position:absolute; left:-9999px; width:1px; height:1px; opacity:0;"/>
            <div class="legacy-file-picker-center-row">
              <button id="wave-b-btn" type="button" class="legacy-file-picker-btn">Choose Wave B</button>
              <span id="wave-b-name" class="legacy-file-name-text">No file chosen</span>
            </div>
          </div>

          <div class="legacy-upload-action-row">
            <button id="compare-upload-btn" class="primary-btn">Create Comparison</button>
          </div>
        </section>
      </section>
    </main>
  `;

  const modeSingleBtn = root.querySelector('#mode-single');
  const modeCompareBtn = root.querySelector('#mode-compare');
  const singleCard = root.querySelector('#single-upload-card');
  const compareCard = root.querySelector('#compare-upload-card');

  function activateMode(mode) {
    const isSingle = mode === 'single';
    modeSingleBtn.classList.toggle('active', isSingle);
    modeCompareBtn.classList.toggle('active', !isSingle);
    singleCard.style.display = isSingle ? '' : 'none';
    compareCard.style.display = isSingle ? 'none' : '';
  }

  modeSingleBtn.addEventListener('click', () => activateMode('single'));
  modeCompareBtn.addEventListener('click', () => activateMode('compare'));

  bindFilePicker(root, '#single-file-btn', '#single-file-input', '#single-file-name');
  bindFilePicker(root, '#wave-a-btn', '#wave-a-file', '#wave-a-name');
  bindFilePicker(root, '#wave-b-btn', '#wave-b-file', '#wave-b-name');

  root.querySelector('#single-upload-btn').addEventListener('click', async () => {
    const file = root.querySelector('#single-file-input').files?.[0];
    if (!file) {
      alert('Please choose a CSV file.');
      return;
    }

    try {
      const result = await uploadSheet(file);
      window.location.hash = `#/sheets/${result.sheetId}`;
    } catch (error) {
      alert(error.message);
    }
  });

  root.querySelector('#compare-upload-btn').addEventListener('click', async () => {
    const waveAFile = root.querySelector('#wave-a-file').files?.[0];
    const waveBFile = root.querySelector('#wave-b-file').files?.[0];

    if (!waveAFile || !waveBFile) {
      alert('Please choose both Wave A and Wave B CSV files.');
      return;
    }

    try {
      const result = await uploadComparisonFiles({
        waveAFile,
        waveBFile,
        surveyName: root.querySelector('#survey-name').value.trim(),
        waveALabel: root.querySelector('#wave-a-label').value.trim() || 'Wave 1',
        waveBLabel: root.querySelector('#wave-b-label').value.trim() || 'Wave 2',
      });
      window.location.hash = `#/comparisons/${result.comparison.comparisonSetId}`;
    } catch (error) {
      alert(error.message);
    }
  });
}