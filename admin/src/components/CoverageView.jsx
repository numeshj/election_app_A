import React, { useMemo } from 'react';
import partiesData from '../data/parties.json';
import { InteractiveMap, Legend } from './InteractiveMap';
import { sriLankaPaths } from '../utils/mapPaths';
import './CoverageView.css';

function CoverageView({ results, districts, onSelectResult }) {
  // Create color map from parties data
  const partyColors = useMemo(() => {
    const colors = {};
    partiesData.SriLankaPresidentialElection2024.parties.forEach(party => {
      colors[party.code] = party.color;
    });
    return colors;
  }, []);

  // Calculate coverage statistics
  const coverageStats = useMemo(() => {
    const districtMap = new Map();

    // Initialize districts
    districts.forEach(district => {
      districtMap.set(district.id, {
        name: district.name.en,
        totalDivisions: district.divisions?.length || 0,
        reportedDivisions: new Set()
      });
    });

    // Count reported divisions
    results.forEach(result => {
      if (result.ed_code && result.pd_code) {
        const district = districtMap.get(result.ed_code);
        if (district) {
          district.reportedDivisions.add(result.pd_code);
        }
      }
    });

    // Calculate completion
    const districtStats = Array.from(districtMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      totalDivisions: data.totalDivisions,
      reportedDivisions: data.reportedDivisions.size,
      completionRatio: data.totalDivisions > 0 ? data.reportedDivisions.size / data.totalDivisions : 0,
      isComplete: data.totalDivisions > 0 && data.reportedDivisions.size === data.totalDivisions
    }));

    const totalDistricts = districtStats.length;
    const completeDistricts = districtStats.filter(d => d.isComplete).length;
    const totalDivisions = districtStats.reduce((sum, d) => sum + d.totalDivisions, 0);
    const reportedDivisions = districtStats.reduce((sum, d) => sum + d.reportedDivisions, 0);

    return {
      districts: districtStats,
      totalDistricts,
      completeDistricts,
      totalDivisions,
      reportedDivisions,
      overallCompletion: totalDivisions > 0 ? reportedDivisions / totalDivisions : 0
    };
  }, [results, districts]);

  // Get winners per district for the map
  const districtWinners = useMemo(() => {
    const winners = new Map();

    results.forEach(result => {
      if (!result.ed_code) return;

      const existing = winners.get(result.ed_code);
      if (!existing || new Date(result.createdAt) > new Date(existing.createdAt)) {
        // Find the winning party
        const topParty = result.by_party?.reduce((max, party) =>
          party.votes > (max?.votes || 0) ? party : max
        );

        winners.set(result.ed_code, {
          districtName: result.ed_name,
          partyCode: topParty?.party_code || 'N/A',
          partyName: topParty?.party_name || 'N/A',
          votes: topParty?.votes || 0,
          result
        });
      }
    });

    return winners;
  }, [results]);

  // Create winners array for InteractiveMap
  const winnersForMap = useMemo(() => {
    const winnersArray = Array.from(districtWinners.values()).map(winner => ({
      ed_name: winner.districtName,
      party_code: winner.partyCode,
      ratio: coverageStats.districts.find(d => d.name === winner.districtName)?.completionRatio || 0,
      complete: coverageStats.districts.find(d => d.name === winner.districtName)?.isComplete || false
    }));
    console.log('Winners for map:', winnersArray);
    console.log('Map paths sample:', sriLankaPaths().slice(0, 3));
    return winnersArray;
  }, [districtWinners, coverageStats.districts]);

  const getDistrictColor = (districtId) => {
    const winner = districtWinners.get(districtId);
    if (!winner) return '#333';

    // Get color from parties data
    return partyColors[winner.partyCode] || '#888888';
  };

  const getCompletionOpacity = (district) => {
    if (district.isComplete) return 1;
    return 0.3 + (district.completionRatio * 0.7);
  };

  return (
    <div className="coverage-view">
      <h2>District Coverage</h2>

      {/* Statistics */}
      <div className="coverage-stats">
        <div className="stat-card">
          <div className="stat-value">{coverageStats.completeDistricts}/{coverageStats.totalDistricts}</div>
          <div className="stat-label">Complete Districts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{coverageStats.reportedDivisions}/{coverageStats.totalDivisions}</div>
          <div className="stat-label">Reported Divisions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.round(coverageStats.overallCompletion * 100)}%</div>
          <div className="stat-label">Overall Completion</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${coverageStats.overallCompletion * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Sri Lanka Map */}
      <div className="map-section">
        <h3>Election Coverage Map</h3>
        <InteractiveMap
          winners={winnersForMap}
          onSelect={(winner) => winner && onSelectResult(winner.result)}
          large={true}
        />
        <Legend />
      </div>

      {/* Districts List */}
      <div className="districts-grid">
        {coverageStats.districts.map(district => {
          const winner = districtWinners.get(district.id);
          return (
            <div
              key={district.id}
              className="district-card"
              style={{
                backgroundColor: getDistrictColor(district.id),
                opacity: getCompletionOpacity(district)
              }}
              onClick={() => winner && onSelectResult(winner.result)}
            >
              <div className="district-name">{district.name.en}</div>
              <div className="district-stats">
                <div className="completion">
                  {district.reportedDivisions}/{district.totalDivisions} divisions
                </div>
                {winner && (
                  <div className="winner">
                    {winner.partyCode}: {winner.votes} votes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="coverage-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#333', opacity: 0.3 }}></div>
          <span>No Data</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#888', opacity: 0.7 }}></div>
          <span>Partial</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#888', opacity: 1 }}></div>
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
}

export default CoverageView;
