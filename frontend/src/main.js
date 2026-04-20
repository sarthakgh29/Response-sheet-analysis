import '../styles/app.css';
import { initRouter } from './router.js';
import { subscribe, getState } from './store.js';
import { renderUploadPage } from '../pages/UploadPage.js';
import { renderSheetsListPage } from '../pages/SheetsListPage.js';
import { renderSheetDetailPage } from '../pages/SheetDetailPage.js';
import { renderComparisonDetailPage } from '../pages/ComparisonDetailPage.js';
import { renderComparisonsListPage } from '../pages/ComparisonsListPage.js';

const root = document.getElementById('app');

async function render() {
  const { route, activeTab } = getState();

  try {
    if (route.name === 'upload') {
      return renderUploadPage(root);
    }

    if (route.name === 'sheets-list') {
      return await renderSheetsListPage(root);
    }

    if (route.name === 'sheet-detail') {
      return await renderSheetDetailPage(root, activeTab, route.params.id);
    }

    if (route.name === 'comparisons-list') {
      return await renderComparisonsListPage(root);
    }

    if (route.name === 'comparison-detail') {
      return await renderComparisonDetailPage(root, route.params.id);
    }

    return renderUploadPage(root);
  } catch (error) {
    root.innerHTML = `<div class="error-box">${error.message}</div>`;
  }
}

subscribe(() => {
  render();
});

initRouter();
