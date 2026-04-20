const API_BASE = 'http://localhost:4000/api';

export async function uploadSheet(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/sheets/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      (await response.json().catch(() => ({ message: 'Upload failed' }))).message || 'Upload failed'
    );
  }

  return response.json();
}

export async function fetchSheets() {
  const response = await fetch(`${API_BASE}/sheets`);
  if (!response.ok) throw new Error('Could not load sheets');
  return response.json();
}

export async function fetchSheetById(sheetId) {
  const response = await fetch(`${API_BASE}/sheets/${sheetId}`);
  if (!response.ok) throw new Error('Could not load sheet');
  return response.json();
}

export async function deleteSheet(sheetId) {
  const response = await fetch(`${API_BASE}/sheets/${sheetId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Could not delete sheet' }));
    throw new Error(error.message || 'Could not delete sheet');
  }

  return response.json();
}
