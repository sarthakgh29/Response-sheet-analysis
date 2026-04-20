import { TABS } from '../../utils/constants.js';

export function TabNav(activeTab) {
  return `
    <div class="legacy-tab-row">
      ${TABS.map((tab) => `
        <button class="legacy-tab-pill ${activeTab === tab.key ? 'active' : ''}" data-tab="${tab.key}">
          ${tab.label.toUpperCase()}
        </button>
      `).join('')}
    </div>
  `;
}
