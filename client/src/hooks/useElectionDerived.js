import { useMemo } from 'react';

/**
 * Build all derived election data structures from base results & districts.
 * Keeps pure memoized transforms separated from UI.
 */
export function useElectionDerived(districts, results){
  // Sorted results (newest first)
  const resultsSorted = useMemo(()=> {
    return [...results].sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0));
  },[results]);
  const latestResult = resultsSorted[0];

  // Latest per polling division
  const latestPerDivision = useMemo(()=> {
    const byDivision = new Map();
    results.forEach(r=> {
      if(!r?.pd_code) return;
      const prev = byDivision.get(r.pd_code);
      if(!prev || new Date(r.createdAt||0) > new Date(prev.createdAt||0)) byDivision.set(r.pd_code, r);
    });
    return [...byDivision.values()];
  },[results]);

  // District aggregation
  const districtData = useMemo(()=> {
    if(!districts.length) return [];
    const latestByDivision = new Map(latestPerDivision.map(r=> [r.pd_code, r]));
    return districts.map(d=> {
      const ed_code = d.id;
      const ed_name = d.name?.en || d.name || d.id;
      const divisionCodes = (d.divisions||[]).map(div=> div.id);
      const perDivision = divisionCodes.map(code=> latestByDivision.get(code)).filter(Boolean);
      const reportedCount = perDivision.length;
      const totalDivisions = divisionCodes.length || 0;
      const coverageRatio = totalDivisions? reportedCount/totalDivisions : 0;
      const complete = totalDivisions>0 && reportedCount === totalDivisions;
      const partyMap = new Map();
      perDivision.forEach(r=> (r.by_party||[]).forEach(p=> {
        const prev = partyMap.get(p.party_code) || { party_code:p.party_code, party_name:p.party_name, votes:0 };
        prev.votes += (p.votes||0);
        partyMap.set(p.party_code, prev);
      }));
      const parties = [...partyMap.values()].sort((a,b)=> b.votes - a.votes);
      const top = parties[0];
      return {
        ed_code, ed_name,
        divisionCodes,
        reportedDivisions: perDivision.map(r=> r.pd_code),
        reportedCount,
        totalDivisions,
        coverageRatio,
        complete,
        parties,
        topParty: top?.party_code || null,
        topVotes: top?.votes || 0,
        partiesCount: parties.length
      };
    });
  },[districts, latestPerDivision]);

  // Winners for maps
  const districtWinners = useMemo(()=>
    districtData.filter(d=> d.topParty).map(d=> ({
      ed_code:d.ed_code,
      ed_name:d.ed_name,
      party_code:d.topParty,
      votes:d.topVotes,
      complete:d.complete,
      ratio:d.coverageRatio,
      data:d
    })),[districtData]);

  // District totals (unsorted base)
  const districtTotalsRaw = useMemo(()=> districtData.map(d=> ({
    ed_code:d.ed_code,
    ed_name:d.ed_name,
    totalVotes:d.parties.reduce((a,p)=> a+p.votes,0),
    topParty:d.topParty,
    topVotes:d.topVotes,
    coverage:d.coverageRatio,
    record:d
  })),[districtData]);

  // Island totals
  const islandTotals = useMemo(()=> {
    const map = new Map();
    districtData.forEach(d=> d.parties.forEach(p=> {
      const prev=map.get(p.party_code)||{ party_code:p.party_code, party_name:p.party_name, votes:0 };
      prev.votes += p.votes||0; map.set(p.party_code, prev);
    }));
    return [...map.values()].sort((a,b)=> b.votes-a.votes);
  },[districtData]);

  const totalDistricts = districtData.length;
  const receivedDistricts = districtData.filter(d=> d.complete).length;

  return {
    // base
    results, districts,
    // derived primitives
    resultsSorted, latestResult, latestPerDivision,
    districtData, districtWinners, districtTotalsRaw,
    islandTotals, totalDistricts, receivedDistricts
  };
}
