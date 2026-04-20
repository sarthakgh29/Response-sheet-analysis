export function s(value) {
  return String(value == null ? '' : value).trim();
}

export function lowerUnderscore(value) {
  return s(value).toLowerCase().replace(/\s+/g, '_');
}

export function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}
