export function mean(values) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function stddev(values) {
  if (!values.length) return null;
  const avg = mean(values);
  const variance = values.reduce((acc, current) => acc + (current - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function distribution(values, rounding = true) {
  const dist = {};
  for (const value of values) {
    const key = rounding ? String(Math.round(value)) : String(value);
    dist[key] = (dist[key] || 0) + 1;
  }
  return dist;
}
