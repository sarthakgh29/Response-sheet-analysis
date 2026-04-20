import { s } from '../utils/normalize.js';

function collectSingleDist(code, rows, qCodes) {
  let colIdx = -1;
  for (let i = 0; i < qCodes.length; i += 1) {
    if (s(qCodes[i]) === code) {
      colIdx = i;
      break;
    }
  }
  if (colIdx < 0) return {};
  const dist = {};
  rows.forEach((row) => {
    const value = s(row._row[colIdx]);
    if (value && value !== '0' && value !== '---' && value.toLowerCase() !== 'nan') {
      dist[value] = (dist[value] || 0) + 1;
    }
  });
  return dist;
}

export function enrichPetStudy({ respondents, qCodes, qTexts, typeHints }) {
  const demographics = {
    hcpType: collectSingleDist('S0_00AZ', respondents, qCodes),
    specialty: collectSingleDist('S0_05Z', respondents, qCodes),
    boardCert: collectSingleDist('S0_10Z', respondents, qCodes),
    yearsInPractice: collectSingleDist('S0_25Z', respondents, qCodes),
    patientCareTime: collectSingleDist('S0_30Z', respondents, qCodes),
    facilityType: collectSingleDist('S0_35Z', respondents, qCodes),
    state: collectSingleDist('S0_40Z', respondents, qCodes),
    pharmaAffil: collectSingleDist('S0_70Z', respondents, qCodes),
  };

  const repInteractions = {};
  for (let i = 0; i < qCodes.length; i += 1) {
    if (s(qCodes[i]) !== 'S0_90ZI') continue;
    const hint = s(typeHints[i]);
    const match = hint.match(/-([\w]+)\s+sales/i);
    const manufacturer = match ? match[1] : 'Unknown';
    repInteractions[manufacturer] ||= { total: 0, respondents: 0, byCount: {} };
    respondents.forEach((respondent) => {
      const value = parseInt(s(respondent._row[i]), 10) || 0;
      if (value > 0) {
        repInteractions[manufacturer].total += value;
        repInteractions[manufacturer].respondents += 1;
        repInteractions[manufacturer].byCount[value] = (repInteractions[manufacturer].byCount[value] || 0) + 1;
      }
    });
  }

  Object.values(repInteractions).forEach((entry) => {
    entry.total = Math.round(entry.total / 3);
    entry.respondents = Math.round(entry.respondents / 3);
  });

  const productAwareness = [];
  for (let i = 0; i < qCodes.length; i += 1) {
    if (s(qCodes[i]) !== 'Q0_20Z') continue;
    const dist = {};
    respondents.forEach((respondent) => {
      const value = s(respondent._row[i]);
      if (value && value !== '---' && value.toLowerCase() !== 'nan') {
        dist[value] = (dist[value] || 0) + 1;
      }
    });
    const total = Object.values(dist).reduce((acc, value) => acc + value, 0);
    if (!total) continue;
    const highAware = (dist['Aware and very knowledgeable of the product/trial data'] || 0)
      + (dist['Aware and somewhat knowledgeable of the product/trial data'] || 0);
    const notAware = dist["Not aware/Don't know"] || 0;
    productAwareness.push({
      colIdx: i,
      dist,
      tot: total,
      highAwarePct: Number(((highAware / total) * 100).toFixed(1)),
      notAwarePct: Number(((notAware / total) * 100).toFixed(1)),
    });
  }

  const attrConditions = {};
  const drugTreatment = {};
  for (let i = 0; i < qCodes.length; i += 1) {
    const code = s(qCodes[i]);
    const text = s(qTexts[i]);
    if (!text || !text.startsWith('{')) continue;
    let count = 0;
    respondents.forEach((respondent) => {
      const value = s(respondent._row[i]);
      if (value && value !== '0' && value !== '---' && value.toLowerCase() !== 'nan') count += 1;
    });
    if (count <= 0) continue;
    if (code === 'S0_50LZ') attrConditions[text.slice(0, 60)] = count;
    if (code === 'S0_55Z') drugTreatment[text.slice(0, 60)] = count;
  }

  return { demographics, repInteractions, productAwareness, attrConditions, drugTreatment };
}
