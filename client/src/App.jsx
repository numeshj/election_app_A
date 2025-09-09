import React, { useState } from 'react';
import { TopNav } from './components/layout.jsx';
import DetailOverlay from './components/DetailOverlay';
import { useElectionData } from './hooks/useElectionData';
import { useElectionDerived } from './hooks/useElectionDerived';
import DashboardView from './views/DashboardView.jsx';
import MapView from './views/MapView.jsx';
import ChartsView from './views/ChartsView.jsx';
import DivisionsView from './views/DivisionsView.jsx';
import CoverageView from './views/CoverageView.jsx';

function App(){
  const { districts, results } = useElectionData();
  const derived = useElectionDerived(districts, results);
  const [view, setView] = useState('dashboard');
  const [selected, setSelected] = useState(null);

  const pick = (r)=> setSelected(r);

  return (
    <div className="client-app">
      <TopNav current={view} onChange={setView} />
      <div className="client-main">
        {view==='dashboard' && <DashboardView data={derived} onSelect={pick} />}
        {view==='map' && <MapView districtWinners={derived.districtWinners} onSelect={pick} />}
        {view==='charts' && <ChartsView islandTotals={derived.islandTotals} districtTotalsRaw={derived.districtTotalsRaw} resultsSorted={derived.resultsSorted} districtData={derived.districtData} />}
        {view==='divisions' && <DivisionsView latestPerDivision={derived.latestPerDivision} onSelect={pick} />}
        {view==='coverage' && <CoverageView totalDistricts={derived.totalDistricts} receivedDistricts={derived.receivedDistricts} districtWinners={derived.districtWinners} onSelect={pick} />}
      </div>
      {selected && <DetailOverlay result={selected} onClose={()=> setSelected(null)} />}
    </div>
  );
}

export default App;

