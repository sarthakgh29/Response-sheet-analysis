import { fetchSheetById } from '../api/sheetsApi.js';
import { askQuestion } from '../api/chatApi.js';
import { Header } from '../components/layout/Header.js';
import { Sidebar } from '../components/layout/Sidebar.js';
import { TabNav } from '../components/layout/TabNav.js';
import { OverviewTab } from '../tabs/OverviewTab.js';
import { RespondentsTab } from '../tabs/RespondentsTab.js';
import { OutliersTab } from '../tabs/OutliersTab.js';
import { ScaleTab } from '../tabs/ScaleTab.js';
import { CategoricalTab } from '../tabs/CategoricalTab.js';
import { TimelineTab } from '../tabs/TimelineTab.js';
import { ChatPanel } from '../components/chat/ChatPanel.js';


const tabRenderers = {
  overview: OverviewTab,
  respondents: RespondentsTab,
  outliers: OutliersTab,
  scale: ScaleTab,
  categorical: CategoricalTab,
  timeline: TimelineTab,
};

function renderTab(sheetData, activeTab) {
  return (tabRenderers[activeTab] || OverviewTab)(sheetData);
}

function animateTabContent(container, html) {
  container.classList.remove('legacy-tab-enter');
  container.innerHTML = html;

  // restart fade animation cleanly
  void container.offsetWidth;
  container.classList.add('legacy-tab-enter');
}
``

export async function renderSheetDetailPage(root, activeTab = 'overview', sheetId) {
  root.innerHTML = `${Header('sheets')}<main class="legacy-detail-shell"><section class="legacy-content-card">Loading sheet...</section></main>`;
  const sheetData = await fetchSheetById(sheetId);

  const chatMessages = [];

  function renderChatMessages() {
    const container = root.querySelector('#chat-messages');
    if (!container) return;
    container.innerHTML = chatMessages
      .map((msg) => `<div class="chat-bubble ${msg.role}">${msg.content}</div>`)
      .join('');
  }

  root.innerHTML = `
    ${Header('sheets')}
    <main class="legacy-detail-shell">
      ${Sidebar(sheetData.analysis.meta)}
      <section class="legacy-main-pane ${activeTab === 'overview' ? 'legacy-overview-mode' : ''}" id="main-pane">
        <div class="legacy-file-head">
          <div>
            <div class="legacy-file-kicker">SHEET #${sheetData.sheet.sheetNo ?? '--'}${sheetData.sheet.studyType ? ` · ${sheetData.sheet.studyType}` : ''}</div>
            <h2 class="legacy-file-name">${sheetData.sheet.fileName}</h2>
          </div>
        </div>
        ${TabNav(activeTab)}
        <section id="tab-content" class="legacy-tab-content legacy-tab-enter">${renderTab(sheetData, activeTab)}</section>
        <section id="chat-panel-wrap" ${activeTab === 'overview' ? '' : 'style="display:none"'}>
          ${ChatPanel(chatMessages)}
        </section>
      </section>
    </main>
  `;

  function bindChatEvents() {
    const chatWrap = root.querySelector('#chat-panel-wrap');
    if (!chatWrap || chatWrap.style.display === 'none') return;

    root.querySelectorAll('.suggested-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        await sendChatMessage(button.dataset.question);
      });
    });

    const form = root.querySelector('#chat-form');
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const input = root.querySelector('#chat-input');
        const message = input.value.trim();
        if (!message) return;
        input.value = '';
        await sendChatMessage(message);
      });
    }

    renderChatMessages();
  }

  async function sendChatMessage(text) {
    const message = text.trim();
    if (!message) return;

    chatMessages.push({ role: 'user', content: message });
    renderChatMessages();

    const history = chatMessages.slice(0, -1).map((msg) => ({ role: msg.role, content: msg.content }));

    try {
      const reply = await askQuestion(sheetId, message, history);
      chatMessages.push({ role: reply.role || 'assistant', content: reply.content || 'No response generated.' });
      renderChatMessages();
    } catch (error) {
      chatMessages.push({ role: 'assistant', content: `Error: ${error.message}` });
      renderChatMessages();
    }
  }

  root.querySelectorAll('[data-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    const selectedTab = button.dataset.tab;
    const mainPane = root.querySelector('#main-pane');
    const tabContent = root.querySelector('#tab-content');
    const chatWrap = root.querySelector('#chat-panel-wrap');

    animateTabContent(tabContent, renderTab(sheetData, selectedTab));

    root.querySelectorAll('.legacy-tab-pill').forEach((node) => node.classList.remove('active'));
    button.classList.add('active');

    if (selectedTab === 'overview') {
      mainPane.classList.add('legacy-overview-mode');
      chatWrap.style.display = '';
      bindChatEvents();
    } else {
      mainPane.classList.remove('legacy-overview-mode');
      chatWrap.style.display = 'none';
    }
  });
});

  bindChatEvents();
}
