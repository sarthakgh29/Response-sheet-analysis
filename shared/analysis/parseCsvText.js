export function parseCsvText(text) {
  const rows = [];
  let currentRow = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      currentRow.push(field);
      field = '';
    } else if (char === '\r' || char === '\n') {
      if (char === '\r' && next === '\n') i += 1;
      currentRow.push(field);
      field = '';
      if (currentRow.some((cell) => cell !== '')) rows.push(currentRow);
      currentRow = [];
    } else {
      field += char;
    }
  }

  currentRow.push(field);
  if (currentRow.some((cell) => cell !== '')) rows.push(currentRow);

  return rows;
}