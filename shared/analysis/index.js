import { parseCsvText } from './parseCsvText.js';
import { detectHeaders } from './detectHeaders.js';
import { buildRespondents } from './buildRespondents.js';
import { classifyQuestions } from './classifyQuestions.js';
import { analyzeScreeners } from './analyzeScreeners.js';
import { enrichPetStudy } from './enrichPetStudy.js';
import { buildTimeline } from './buildTimeline.js';
import { buildOverview } from './buildOverview.js';
import { buildMeta } from './buildMeta.js';

export function analyzeSurveyCsv(text, fileName = 'uploaded.csv') {
  const rawRows = parseCsvText(text);
  const { metaCols, qCodes, qTexts, typeHints, dataStartIndex } = detectHeaders(rawRows);
  const { respondents } = buildRespondents(rawRows, metaCols, dataStartIndex);
  const questionResult = classifyQuestions({ respondents, qCodes, qTexts, metaCols });
  const screener = analyzeScreeners({ respondents, qCodes, qTexts, typeHints });
  const enrichment = enrichPetStudy({ respondents, qCodes, qTexts, typeHints });
  const completedRespondents = respondents.filter((respondent) => respondent.status === 'Completed');
  const timeline = buildTimeline(completedRespondents);
  const overview = buildOverview({ respondents, completedRespondents, screener });
  const meta = buildMeta({
    respondents,
    questions: questionResult.questions,
    scaleQs: questionResult.scaleQs,
    catQs: questionResult.catQs,
    overview,
    timeline,
    screener,
    enrichment,
  });

  return {
    fileName,
    respondents,
    questions: questionResult.questions,
    scaleQs: questionResult.scaleQs,
    catQs: questionResult.catQs,
    meta,
  };
}
