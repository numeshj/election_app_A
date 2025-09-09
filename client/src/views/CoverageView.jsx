import React from 'react';
import { InteractiveMap } from '../components/map.jsx';
import './CoverageView.css';

export default function CoverageView({ totalDistricts, receivedDistricts, districtWinners, onSelect }){
  return <div className="view-shell CoverageView-root">
    <h2 className="panel-heading mt0">Coverage</h2>
    <div className="CoverageView-progressBar"><div style={{width: totalDistricts? (receivedDistricts/totalDistricts*100).toFixed(1)+'%':'0%'}} /></div>
    <p className="CoverageView-coverageText"><strong>{receivedDistricts}</strong> of <strong>{totalDistricts}</strong> districts reported.</p>
    <InteractiveMap winners={districtWinners} onSelect={(d)=> onSelect(d.data)} />
  </div>;
}
