export function SuggestedQueries() {
  const suggestions = [
    'Give me an executive summary of this sheet',
    'What was the primary screen-out question?',
    'Summarize the timing metrics',
    'Show outlier summary',
    'Summarize timeline',
    'Summarize scale questions',
  ];

  return `
    <div class="legacy-suggestions">
      ${suggestions.map((text) => `<button class="legacy-suggestion-btn suggested-btn" data-question="${text}">${text}</button>`).join('')}
    </div>
  `;
}
