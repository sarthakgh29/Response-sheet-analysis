import { RespondentsTable } from '../components/tables/RespondentsTable.js';
export function RespondentsTab(sheetData) { return RespondentsTable(sheetData.analysis.respondents || []); }
