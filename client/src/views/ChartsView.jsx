import React from 'react';
import { Card } from '../components/layout.jsx';
import { BarChart, PieChart, LeadMarginChart, CoverageTimeline, PartyTrendChart } from '../components/charts.jsx';
import './ChartsView.css';

export default function ChartsView({ islandTotals, districtTotalsRaw, resultsSorted, districtData }) {
  return <div className="view-shell ChartsView-root">
    <h2 className="panel-heading mt0">Charts</h2>
    <div className="ChartsView-gridAlt">
      <Card title='Island Vote Share (Top 6)'><BarChart data={islandTotals.slice(0,6)} /></Card>
      <Card title='Island Vote Share Pie (Top 6)'><PieChart data={islandTotals.slice(0,6)} /></Card>
      <Card title='District Lead Margins'><LeadMarginChart districts={districtTotalsRaw.slice(0,20)} /></Card>
      <Card title='Coverage Timeline'><CoverageTimeline results={resultsSorted} districts={districtData} /></Card>
      <Card title='Party Cumulative Trend'><PartyTrendChart results={resultsSorted} /></Card>
    </div>
  </div>;
}
