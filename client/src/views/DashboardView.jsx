import React, { useState, useMemo } from 'react';
import { Card } from '../components/layout.jsx';
import { InteractiveMap, Legend } from '../components/map.jsx';
import SortableTH from '../components/SortableTH';
import { getPartyColor } from '../utils/colors';
import { sortList, toggleSort } from '../utils/sorting';
import './DashboardView.css';

export default function DashboardView({ data, onSelect }){
  const { latestResult, islandTotals, districtTotalsRaw, districtData, districtWinners, resultsSorted } = data;
  const [districtSort, setDistrictSort] = useState({ field:'ed_name', dir:'asc' });

  const districtTotals = useMemo(()=> sortList(districtTotalsRaw, districtSort, districtSort.field==='ed_name'?'string':'auto'), [districtTotalsRaw, districtSort]);

  return (
    <div className="DashboardView-split DashboardView-root">
      <div className="DashboardView-left">
        <h1 className="DashboardView-pageTitle">Sri Lanka Presidential Results (Live)</h1>
        <h3 className="DashboardView-sectionTitle">District Leaders Map</h3>
        <InteractiveMap winners={districtWinners} onSelect={(d)=> onSelect(d.data)} />
        <Legend />
  <div className="DashboardView-cardsGrid">
          <Card title="Latest Result - Just Received">
            {!latestResult && <em>No results yet</em>}
            {latestResult && <div onClick={()=> onSelect(latestResult)} className="clickable">
              <strong>{latestResult.ed_name} / {latestResult.pd_name}</strong><br/>
              <small>ID: {latestResult.id}</small><br/>
              <small>Seq: {latestResult.sequence_number}</small><br/>
              <small>Created: {new Date(latestResult.createdAt).toLocaleTimeString()}</small>
            </div>}
          </Card>
          <Card title="Island Total">
            {islandTotals.length===0 && <em>No data</em>}
            {islandTotals.slice(0,8).map(p=> <div key={p.party_code} className="list-row">
              <span><span className="party-swatch" style={{background:getPartyColor(p.party_code)}}></span>{p.party_code}</span>
              <span className="mono">{p.votes.toLocaleString()}</span>
            </div>)}
          </Card>
          <Card title="District Totals (sortable)">
            {districtTotals.length===0 && <em>No data</em>}
            <div className="scroll-box h200">
              <table className="tight-table">
                <thead><tr>
                  <SortableTH label='District' field='ed_name' state={districtSort} setState={(s)=> setDistrictSort(toggleSort(s,'ed_name'))} />
                  <SortableTH label='Votes' field='totalVotes' numeric state={districtSort} setState={(s)=> setDistrictSort(toggleSort(s,'totalVotes'))} />
                  <SortableTH label='Coverage' field='coverage' numeric state={districtSort} setState={(s)=> setDistrictSort(toggleSort(s,'coverage'))} />
                  <th align='left'>Top</th>
                </tr></thead>
                <tbody>{districtTotals.map(d=> <tr key={d.ed_code} className="row-link" onClick={()=> onSelect(d.record)}>
                  <td>{d.ed_name}</td>
                  <td align='right' className="mono">{d.totalVotes.toLocaleString()}</td>
                  <td align='right' className="mono">{(d.coverage*100).toFixed(0)}%</td>
                  <td><span className="party-swatch sm" style={{background:getPartyColor(d.topParty)}}></span>{d.topParty}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </Card>
          <Card title="All Results in Received Order">
            {resultsSorted.length===0 && <em>No results</em>}
            <div className="scroll-box h200 list-compact">
              {resultsSorted.map(r=> <div key={r.id} className="list-item row-link" onClick={()=> onSelect(r)}>
                <strong>{r.sequence_number}</strong> - {r.ed_name} / {r.pd_name} <small className="dim">{new Date(r.createdAt).toLocaleTimeString()}</small>
              </div>)}
            </div>
          </Card>
          <Card title="District Completion">
            <div className="scroll-box h200">
              <table className="tight-table">
                <thead><tr><th align='left'>District</th><th align='right'>Divisions</th><th align='left'>Status</th></tr></thead>
                <tbody>{districtData.map(d=> <tr key={d.ed_code} className="row-link" onClick={()=> onSelect(d)}>
                  <td>{d.ed_name}</td>
                  <td align='right' className="mono">{d.reportedCount}/{d.totalDivisions}</td>
                  <td><span className={d.complete? 'status-chip complete':'status-chip partial'}>{d.complete? 'Complete':'Partial'}</span></td>
                </tr>)}</tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
  <div className="DashboardView-right">
        <h2 className="panel-heading mt0">District Leaders</h2>
        <table className="tight-table">
          <thead><tr><th align='left'>District</th><th align='left'>Party</th><th align='right'>Votes</th></tr></thead>
          <tbody>{districtWinners.map(w=> <tr key={w.ed_code} className="row-link" onClick={()=> onSelect(w.data)}>
            <td>{w.ed_name}</td>
            <td><span className="party-swatch" style={{background:getPartyColor(w.party_code)}}></span>{w.party_code}</td>
            <td align='right' className="mono">{w.votes.toLocaleString()}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
