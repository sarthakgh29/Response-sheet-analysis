export function RespondentsTable(respondents) {
  return `<div class="table-wrap"><table><thead><tr><th>Name</th><th>ID</th><th>Status</th><th>Time</th><th>Rating</th><th>Outlier</th></tr></thead><tbody>${respondents.map((row)=>`<tr><td>${row.firstName} ${row.lastName}</td><td>${row.id}</td><td>${row.status}</td><td>${row.timeTakenMin != null ? `${row.timeTakenMin}m` : '--'}</td><td>${row.userRating ?? '--'}</td><td>${row.outlierType || '--'}</td></tr>`).join('')}</tbody></table></div>`;
}
