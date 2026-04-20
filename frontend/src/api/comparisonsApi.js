const API_BASE = 'http://localhost:4000/api';

export async function uploadComparisonFiles({ waveAFile, waveBFile, surveyName, waveALabel, waveBLabel }) {
  const formData = new FormData();
  formData.append('waveA', waveAFile);
  formData.append('waveB', waveBFile);
  formData.append('surveyName', surveyName || '');
  formData.append('waveALabel', waveALabel || '');
  formData.append('waveBLabel', waveBLabel || '');

  const response = await fetch(`${API_BASE}/comparisons/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Comparison upload failed.' }));
    throw new Error(error.message || 'Comparison upload failed.');
  }

  return response.json();
}

export async function fetchComparisons() {
  const response = await fetch(`${API_BASE}/comparisons`);
  if (!response.ok) {
    throw new Error('Could not load comparisons.');
  }
  return response.json();
}

export async function fetchComparisonById(comparisonSetId) {
  const response = await fetch(`${API_BASE}/comparisons/${comparisonSetId}`);
  if (!response.ok) {
    throw new Error('Could not load comparison.');
  }
  return response.json();
}

export async function askComparisonQuestion(comparisonSetId, message, history = []) {
  const response = await fetch(`${API_BASE}/comparisons/${comparisonSetId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Could not fetch comparison answer',
    }));
    throw new Error(error.message || 'Could not fetch comparison answer');
  }

  return response.json();
}

export async function deleteComparisonById(comparisonSetId) {
  const response = await fetch(`${API_BASE}/comparisons/${comparisonSetId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Could not delete comparison.',
    }));
    throw new Error(error.message || 'Could not delete comparison.');
  }

  return response.json();
}
