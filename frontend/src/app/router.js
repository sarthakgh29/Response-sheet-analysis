import { setState } from './store.js';

function parseHash() {
  const hash = window.location.hash.replace(/^#/, '') || '/upload';
  const parts = hash.split('/').filter(Boolean);

  if (parts[0] === 'comparisons' && parts[1]) {
    return { name: 'comparison-detail', params: { id: parts[1] } };
  }

  if (parts[0] === 'comparisons') {
    return { name: 'comparisons-list', params: {} };
  }

  if (parts[0] === 'sheets' && parts[1]) {
    return { name: 'sheet-detail', params: { id: parts[1] } };
  }

  if (parts[0] === 'sheets') {
    return { name: 'sheets-list', params: {} };
  }

  return { name: 'upload', params: {} };
}

export function navigate(path) {
  window.location.hash = path;
}

export function initRouter() {
  const apply = () => setState({ route: parseHash() });
  window.addEventListener('hashchange', apply);
  apply();
}