import React from 'react';
import { InteractiveMap, Legend } from '../components/map.jsx';
import './MapView.css';

export default function MapView({ districtWinners, onSelect }){
  return <div className="view-shell MapView-root">
    <h2 className="panel-heading mt0">Interactive Map</h2>
    <InteractiveMap winners={districtWinners} onSelect={(d)=> onSelect(d.data)} large />
    <p className="MapView-hint">Hover / click districts to inspect. Colors correspond to leading party.</p>
    <Legend />
  </div>;
}
