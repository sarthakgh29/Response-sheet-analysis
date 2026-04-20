export function UploadDropzone() {
  return `<div class="upload-card"><input id="upload-input" type="file" accept=".csv" hidden /><div class="upload-icon">CSV</div><h2>Upload LimeSurvey CSV</h2><p>Backend parsing + PostgreSQL persistence</p><button id="upload-trigger" class="primary-btn">Choose file</button></div>`;
}
