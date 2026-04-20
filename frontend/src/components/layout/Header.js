export function Header(active = 'upload') {
  return `
    <header class="legacy-topbar">
      <div class="legacy-brand">
        <div class="legacy-brand-icon">SI</div>
        <div class="legacy-brand-copy">
          <div class="legacy-brand-title">Survey Insights</div>
          <div class="legacy-brand-subtitle">Response Sheet Agent</div>
        </div>
      </div>

      <nav class="legacy-global-nav">
        <a href="#/upload" class="legacy-pill ${active === 'upload' ? 'active' : ''}">Upload</a>
        <a href="#/sheets" class="legacy-pill ${active === 'sheets' ? 'active' : ''}">Sheets</a>
        <a href="#/comparisons" class="legacy-pill ${active === 'comparisons' ? 'active' : ''}">Comparisons</a>
      </nav>

      <div class="legacy-topbar-right"></div>
    </header>
  `;
}