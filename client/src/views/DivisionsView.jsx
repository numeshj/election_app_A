import React, { useState, useMemo } from 'react';
import SortableTH from '../components/SortableTH';
import { getPartyColor } from '../utils/colors';
import { sortList, toggleSort } from '../utils/sorting';
import './DivisionsView.css';

export default function DivisionsView({ latestPerDivision, onSelect }){
  const [sort, setSort] = useState({ field:'ed_name', dir:'asc' });
  const rows = useMemo(()=> {
    const base = latestPerDivision.map(r=> {
      const partiesSorted=[...(r.by_party||[])].sort((a,b)=> b.votes - a.votes);
      const lead=partiesSorted[0]; const second=partiesSorted[1];
      const totalVotes = partiesSorted.reduce((a,p)=> a+p.votes,0);
      return {
        id:r.id, ed_code:r.ed_code, ed_name:r.ed_name, pd_code:r.pd_code, pd_name:r.pd_name,
        totalVotes,
        leadParty:lead?.party_code || null,
        leadVotes:lead?.votes || 0,
        margin: second? (lead.votes-second.votes):(lead?.votes||0),
        marginPct: second? ((lead.votes-second.votes)/(lead.votes||1)):1,
        record:r
      };
    });
    return sortList(base, sort, (sort.field==='ed_name'|| sort.field==='pd_name')?'string':'auto');
  },[latestPerDivision, sort]);

  return <div className="view-shell DivisionsView-root">
    <h2 className="panel-heading mt0">Divisions (Latest Results)</h2>
    <div className="scroll-box h400">
      <table className="tight-table">
        <thead><tr>
          <SortableTH label='District' field='ed_name' state={sort} setState={(s)=> setSort(toggleSort(s,'ed_name'))} />
          <SortableTH label='Division' field='pd_name' state={sort} setState={(s)=> setSort(toggleSort(s,'pd_name'))} />
          <SortableTH label='Votes' field='totalVotes' numeric state={sort} setState={(s)=> setSort(toggleSort(s,'totalVotes'))} />
          <SortableTH label='Lead' field='leadVotes' numeric state={sort} setState={(s)=> setSort(toggleSort(s,'leadVotes'))} />
          <SortableTH label='Margin' field='margin' numeric state={sort} setState={(s)=> setSort(toggleSort(s,'margin'))} />
          <SortableTH label='Margin %' field='marginPct' numeric state={sort} setState={(s)=> setSort(toggleSort(s,'marginPct'))} />
        </tr></thead>
        <tbody>{rows.map(r=> <tr key={r.id} className='row-link' onClick={()=> onSelect(r.record)}>
          <td>{r.ed_name}</td>
          <td>{r.pd_name}</td>
          <td align='right' className='mono'>{r.totalVotes.toLocaleString()}</td>
          <td><span className='party-swatch sm' style={{background:getPartyColor(r.leadParty)}}></span>{r.leadParty}</td>
          <td align='right' className='mono'>{r.margin.toLocaleString()}</td>
          <td align='right' className='mono'>{(r.marginPct*100).toFixed(1)}%</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}
