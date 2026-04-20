export function formatDate(dateString) {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? String(dateString).slice(0, 10) : date.toLocaleDateString();
}
