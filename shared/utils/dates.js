import { s } from './normalize.js';

export function normalizeDateKey(rawValue) {
  const raw = s(rawValue).slice(0, 10);
  if (!raw) return null;
  const sep = raw.includes('-') ? '-' : raw.includes('/') ? '/' : null;
  if (!sep) return raw;
  const parts = raw.split(sep);
  if (parts[0]?.length <= 2 && parts[2]?.length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return raw;
}
