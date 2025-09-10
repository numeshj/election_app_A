// Color mapping sourced from parties.json (authoritative list).
import partiesData from '../data/parties.json';

const partyList = (partiesData?.SriLankaPresidentialElection2024?.parties) || [];
// Build direct lookup { CODE: color }
const fixedColors = Object.fromEntries(partyList.map(p => [p.code, p.color]));

export function getPartyColor(code) {
  if (!code) return '#666';
  return fixedColors[code] || '#666';
}

export function getPartyMeta(code) {
  return partyList.find(p => p.code === code);
}

export const allParties = partyList.slice();
