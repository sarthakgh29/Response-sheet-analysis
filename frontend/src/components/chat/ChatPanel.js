import { MessageBubble } from './MessageBubble.js';
import { SuggestedQueries } from './SuggestedQueries.js';

export function ChatPanel(messages) {
  return `
    <section class="legacy-chat-card">
      <div class="legacy-section-heading">Chat</div>
      ${SuggestedQueries()}
      <div id="chat-messages" class="legacy-chat-messages">
        ${messages.map(MessageBubble).join('')}
      </div>
      <form id="chat-form" class="legacy-chat-form">
        <input id="chat-input" placeholder="Ask about this sheet" />
        <button class="legacy-send-btn">Send</button>
      </form>
    </section>
  `;
}
