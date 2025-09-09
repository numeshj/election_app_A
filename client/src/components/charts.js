import React from 'react';
import { getPartyColor } from '../utils/colors';
import './charts.css';

export function BarChart({ data }) {
  if (!data?.length) return <em>No data</em>;
  const max = Math.max(...data.map(d => d.votes));
  return (
    <div className="bar-chart">
      {data.map(d => (
        <div key={d.party_code} className="bar-row">
          <div className="bar-row-head">
            <span>{d.party_code}</span>
            <span>{d.votes.toLocaleString()}</span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${(d.votes / max) * 100}%`,
                background: getPartyColor(d.party_code),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PieChart({ data }) {
  if (!data?.length) return <em>No data</em>;
  const total = data.reduce((sum, d) => sum + d.votes, 0);
  let offset = 0;
  return (
    <div className="pie-chart">
      <svg viewBox="0 0 32 32" className="pie-svg">
        {data.map(d => {
          const percent = (d.votes / total) * 100;
          const circle = (
            <circle
              key={d.party_code}
              r="15.9"
              cx="16"
              cy="16"
              fill="none"
              stroke={getPartyColor(d.party_code)}
              strokeWidth="8"
              strokeDasharray={`${percent} ${100 - percent}`}
              strokeDashoffset={-offset}
            />
          );
          offset += percent;
          return circle;
        })}
      </svg>
      <div className="pie-legend">
        {data.map(d => (
          <div key={d.party_code} className="pie-legend-row">
            <span className="party-swatch" style={{ background: getPartyColor(d.party_code) }} />
            {d.party_code} {(d.votes / total * 100).toFixed(1)}%
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeadMarginChart({ districts }) {
  if (!districts?.length) return <em>No data</em>;
  const rows = districts
    .filter(d => d.topVotes > 0)
    .map(d => ({
      name: d.ed_name,
      margin: d.topVotes - (d.record?.parties?.[1]?.votes || 0),
      topParty: d.topParty,
    }));
  if (!rows.length) return <em>No data</em>;
  const max = Math.max(...rows.map(r => r.margin));
  return (
    <div className="bar-chart small">
      {rows.map(r => (
        <div key={r.name} className="bar-row">
          <div className="bar-row-head">
            <span>{r.name}</span>
            <span>{r.margin.toLocaleString()}</span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${(r.margin / max) * 100}%`,
                background: getPartyColor(r.topParty),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CoverageTimeline({ results, districts }) {
  if (!results?.length) return <em>No data</em>;
  const completed = new Set();
  const points = [];
  results.forEach((r, i) => {
    const key = r.ed_code;
    if (!completed.has(key)) {
      const dist = districts.find(d => d.ed_code === key);
      if (dist && dist.reportedCount === dist.totalDivisions) {
        completed.add(key);
      }
    }
    points.push({ x: i + 1, y: completed.size });
  });
  const maxY = districts.length || 1;
  const w = 260, h = 120, pad = 24;
  const path = points.map((p, i) => {
    const x = pad + (p.x / points.length) * (w - pad * 2);
    const y = h - pad - (p.y / maxY) * (h - pad * 2);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mini-line">
      <rect x="0" y="0" width={w} height={h} stroke="#ccc" fill="none" />
      <path d={path} stroke="#2ea043" strokeWidth="2" fill="none" />
      <text x={pad} y={12} fontSize="10">0</text>
      <text x={w - 18} y={12} fontSize="10">{maxY}</text>
    </svg>
  );
}

export function PartyTrendChart({ results }) {
  if (!results?.length) return <em>No data</em>;
  const series = new Map();
  results.forEach((r, i) => {
    r.by_party.forEach(p => {
      const arr = series.get(p.party_code) || [];
      const prev = arr.length ? arr[arr.length - 1].y : 0;
      arr.push({ x: i + 1, y: prev + p.votes });
      series.set(p.party_code, arr);
    });
  });
  const allPoints = Array.from(series.values()).flat();
  const maxY = Math.max(...allPoints.map(p => p.y));
  const w = 260, h = 140, pad = 24;
  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${w} ${h}`} className="mini-line">
        {Array.from(series.entries()).map(([code, pts]) => {
          const d = pts.map((p, i) => {
            const x = pad + (p.x / results.length) * (w - pad * 2);
            const y = h - pad - (p.y / maxY) * (h - pad * 2);
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
          }).join(' ');
          return <path key={code} d={d} stroke={getPartyColor(code)} strokeWidth="2" fill="none" />;
        })}
      </svg>
      <div className="mini-legend">
        {Array.from(series.keys()).slice(0, 8).map(code => (
          <span key={code} className="legend-chip">
            <span className="party-swatch sm" style={{ background: getPartyColor(code) }} />
            {code}
          </span>
        ))}
      </div>
    </div>
  );
}
