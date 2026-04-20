import { s } from '../utils/normalize.js';

function isPanelFailure(respondent) {
  const status = (respondent.status || '').toLowerCase();
  return status.includes('panel screener');
}

function isWaveFailure(respondent) {
  const status = (respondent.status || '').toLowerCase();
  return (status.includes('screener') || status.includes('screen'))
    && !status.includes('panel')
    && !status.includes('partial')
    && status !== 'completed';
}

function detectRepInteractionSignal(qCodes = [], qTexts = [], typeHints = []) {
  const normalizedCodes = qCodes.map((code) => s(code));
  const normalizedTexts = qTexts.map((text) => s(text).toLowerCase());
  const normalizedHints = typeHints.map((hint) => s(hint).toLowerCase());

  // 1) Exact code already used by the original app for rep interaction enrichment
  const exactMatches = normalizedCodes
    .map((code, index) => ({ code, index }))
    .filter((item) => item.code === 'S0_90ZI')
    .map((item) => item.index);

  if (exactMatches.length > 0) {
    return {
      hasRepInteractionQuestions: true,
      source: 'exact_code:S0_90ZI',
      matches: exactMatches,
    };
  }

  // 2) Fallback: detect rep interaction concept from wording / type hints
  const repPatterns = [
    /sales representative/i,
    /sales rep/i,
    /rep interaction/i,
    /interaction with the sales representative/i,
    /most recent interaction/i,
  ];

  const textMatches = [];
  for (let i = 0; i < Math.max(normalizedTexts.length, normalizedHints.length); i += 1) {
    const text = normalizedTexts[i] || '';
    const hint = normalizedHints[i] || '';
    const matched = repPatterns.some((pattern) => pattern.test(text) || pattern.test(hint));
    if (matched) {
      textMatches.push(i);
    }
  }

  if (textMatches.length > 0) {
    return {
      hasRepInteractionQuestions: true,
      source: 'text_or_typehint_fallback',
      matches: textMatches,
    };
  }

  return {
    hasRepInteractionQuestions: false,
    source: 'none',
    matches: [],
  };
}

function detectStudyType({ qCodes = [], qTexts = [], typeHints = [] }) {
  const repSignal = detectRepInteractionSignal(qCodes, qTexts, typeHints);

  // FINAL RULE:
  // PET = rep interaction question exists
  // ATU = rep interaction question does not exist
  const studyType = repSignal.hasRepInteractionQuestions ? 'PET' : 'ATU';

  return {
    studyType,
    studySignals: {
      hasRepInteractionQuestions: repSignal.hasRepInteractionQuestions,
      repSignalSource: repSignal.source,
      repSignalMatches: repSignal.matches,
    },
  };
}

export function analyzeScreeners({ respondents, qCodes, qTexts, typeHints = [] }) {
  const screenerMap = {};
  const totalColumns = Math.max(qCodes.length, qTexts.length);

  for (let colIdx = 0; colIdx < totalColumns; colIdx += 1) {
    const code = s(qCodes[colIdx]);
    const text = s(qTexts[colIdx]);
    if (!code || !text) continue;
    if (!(code.startsWith('S0_') || code.startsWith('BP') || code.startsWith('Q0_') || code.startsWith('EQ_'))) continue;
    if (text === 'nan' || text.startsWith('{') || text.length <= 2) continue;
    screenerMap[colIdx] = { code, text: text.slice(0, 160), colIdx };
  }

  const screenedOut = respondents.filter((respondent) => isPanelFailure(respondent) || isWaveFailure(respondent));
  const panelScreenouts = respondents.filter(isPanelFailure);
  const waveScreenouts = respondents.filter(isWaveFailure);

  // Study type now uses only rep-interaction detection
  const { studyType, studySignals } = detectStudyType({
    qCodes,
    qTexts,
    typeHints,
  });

  const outLast = screenedOut.map((respondent) => {
    let lastColIdx = null;
    let lastAnsweredQ = null;
    let lastAnsweredVal = null;

    for (let colIdx = 0; colIdx < respondent._row.length; colIdx += 1) {
      const value = s(respondent._row[colIdx]);
      if (value && value !== '---' && value.toLowerCase() !== 'nan' && screenerMap[colIdx]) {
        lastColIdx = colIdx;
        lastAnsweredQ = screenerMap[colIdx].text;
        lastAnsweredVal = value;
      }
    }

    return {
      ...respondent,
      lastColIdx,
      lastAnsweredQ,
      lastAnsweredVal,
      screenType: isPanelFailure(respondent) ? 'Panel' : isWaveFailure(respondent) ? 'Wave' : 'Unknown',
    };
  });

  const dropoffCounts = {};
  const dropoffAnswers = {};
  const dropoffTypes = {};

  outLast.forEach((respondent) => {
    if (!respondent.lastAnsweredQ) return;
    const question = respondent.lastAnsweredQ;
    dropoffCounts[question] = (dropoffCounts[question] || 0) + 1;
    dropoffTypes[question] ||= { Panel: 0, Wave: 0 };
    dropoffTypes[question][respondent.screenType] += 1;
    if (respondent.lastAnsweredVal) {
      dropoffAnswers[question] ||= {};
      dropoffAnswers[question][respondent.lastAnsweredVal] = (dropoffAnswers[question][respondent.lastAnsweredVal] || 0) + 1;
    }
  });

  const doRanked = Object.entries(dropoffCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([qText, count]) => ({
      qText,
      count,
      pct: screenedOut.length ? Number(((count / screenedOut.length) * 100).toFixed(1)) : 0,
      screenTypes: dropoffTypes[qText] || { Panel: 0, Wave: 0 },
      topAnswers: Object.entries(dropoffAnswers[qText] || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([ans, n]) => ({ ans, n })),
    }));

  const primaryPanel = [...doRanked].sort((a, b) => b.screenTypes.Panel - a.screenTypes.Panel)[0] || null;
  const primaryWave = [...doRanked].sort((a, b) => b.screenTypes.Wave - a.screenTypes.Wave)[0] || null;
  const primaryOverall = doRanked[0] || null;

  const screenerDists = Object.values(screenerMap).map((column) => {
    const allAnswers = {};
    let total = 0;

    respondents
      .filter((respondent) => !(respondent.status || '').toLowerCase().includes('partial'))
      .forEach((respondent) => {
        const value = s(respondent._row[column.colIdx]);
        if (value && value !== '---' && value.toLowerCase() !== 'nan') {
          allAnswers[value] = (allAnswers[value] || 0) + 1;
          total += 1;
        }
      });

    if (!total) return null;

    const screenoutAnswers = {};
    screenedOut.forEach((respondent) => {
      const value = s(respondent._row[column.colIdx]);
      if (value && value !== '---' && value.toLowerCase() !== 'nan') {
        screenoutAnswers[value] = (screenoutAnswers[value] || 0) + 1;
      }
    });

    const sA = Object.entries(allAnswers)
      .sort((a, b) => b[1] - a[1])
      .map(([ans, n]) => ({
        ans,
        n,
        pct: Number(((n / total) * 100).toFixed(1)),
        sN: screenoutAnswers[ans] || 0,
        sPct: Number((((screenoutAnswers[ans] || 0) / n) * 100).toFixed(1)),
      }));

    return {
      code: column.code,
      text: column.text,
      colIdx: column.colIdx,
      tot: total,
      sA,
      doh: dropoffCounts[column.text] || 0,
      doPct: screenedOut.length ? Number((((dropoffCounts[column.text] || 0) / screenedOut.length) * 100).toFixed(1)) : 0,
      pats: [],
    };
  }).filter(Boolean);

  return {
    totalOut: screenedOut.length,
    psfCount: panelScreenouts.length,
    wsfCount: waveScreenouts.length,
    studyType,
    studySignals,
    primDO: primaryOverall,
    primPSF: primaryPanel,
    primWSF: primaryWave,
    doRanked,
    scrDists: screenerDists,
    psfLast: outLast.filter((respondent) => respondent.screenType === 'Panel'),
    wsfLast: outLast.filter((respondent) => respondent.screenType === 'Wave'),
  };
}
