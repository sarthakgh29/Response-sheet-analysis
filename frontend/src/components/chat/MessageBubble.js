export function MessageBubble(message) { return `<div class="chat-bubble ${message.role}">${message.content}</div>`; }
