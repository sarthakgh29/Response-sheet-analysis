const API_BASE = 'http://localhost:4000/api';

export async function askQuestion(sheetId, message, history = []) {
  const response = await fetch(`${API_BASE}/sheets/${sheetId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Could not fetch answer',
    }));
    throw new Error(error.message || 'Could not fetch answer');
  }

  return response.json();
}