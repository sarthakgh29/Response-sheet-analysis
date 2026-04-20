import { env } from '../config/env.js';
import { getComparisonSet } from './comparison.service.js';
import { buildComparisonSystemPrompt } from './comparisonPrompt.service.js';

export async function answerComparisonQuestion(comparisonSetId, payload) {
  if (env.llmProvider !== 'anthropic') {
    throw new Error(`Unsupported LLM_PROVIDER: ${env.llmProvider}`);
  }

  if (!env.llmApiKey || env.llmApiKey === 'YOUR_ANTHROPIC_API_KEY_HERE') {
    return {
      role: 'assistant',
      content:
        'Anthropic API key is not configured yet. Add LLM_API_KEY in backend/.env and restart the backend.',
    };
  }

  const comparisonData = await getComparisonSet(comparisonSetId);
  if (!comparisonData) {
    throw new Error('Comparison set not found.');
  }

  const { message, history = [] } = payload ?? {};
  if (!message) {
    throw new Error('message is required.');
  }

  const systemPrompt = buildComparisonSystemPrompt(
    comparisonData.comparisonJson,
    comparisonData.comparison
  );

  const messages = [
    ...history
      .filter((item) => item?.role && item?.content)
      .map((item) => ({
        role: item.role,
        content: item.content,
      })),
    {
      role: 'user',
      content: message,
    },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.llmApiKey,
      'anthropic-version': env.anthropicVersion,
    },
    body: JSON.stringify({
      model: env.llmModel,
      max_tokens: 1200,
      temperature: 0.2,
      system: systemPrompt,
      messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Anthropic API request failed.');
  }

  const text = (data?.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  return {
    role: 'assistant',
    content: text || 'No response generated.',
  };
}
``