import React from 'react';
import { getPartyColor } from '../utils/colors';
import './DetailOverlay.css';

export default function DetailOverlay({ result, onClose }) {
  // If no result data, don't show anything
  if (!result) {
    return null;
  }

  // Check if this is showing data for a whole district (aggregate) or just one division
  const isDistrictView = result && result.divisionCodes;

  // Get the parties data - different format for district vs division
  const parties = isDistrictView ? result.parties : (result.by_party || []);

  // Find the party with the most votes
  const sortedParties = parties.slice().sort((a, b) => b.votes - a.votes);
  const topParty = sortedParties[0];

  // Calculate total votes for district view
  const totalVotes = isDistrictView
    ? parties.reduce((total, party) => total + party.votes, 0)
    : 0;

  return (
    <div className="overlay-lite" role="dialog">
      <div className="overlay-content-box">

        {/* Header section with title and close button */}
        <div className="overlay-head">
          <h2 className="overlay-title">
            {isDistrictView
              ? result.ed_name
              : `${result.ed_name} / ${result.pd_name}`
            }
          </h2>
          <button onClick={onClose} className="btn-close">
            Close
          </button>
        </div>

        {/* Information about the data */}
        {isDistrictView ? (
          <p className="overlay-meta">
            Divisions reported: {result.reportedCount}/{result.totalDivisions}
            ({Math.round(result.coverageRatio * 100)}%)
            • Status: {result.complete ? 'Complete' : 'Partial'}
          </p>
        ) : (
          <p className="overlay-meta">
            Seq {result.sequence_number} • Ref {result.reference} •
            {new Date(result.createdAt).toLocaleString()}
          </p>
        )}

        {/* Summary section */}
        <div className="overlay-summary">

          {/* Left side - Summary info */}
          <div className="summary-block">
            <strong>
              {isDistrictView ? 'Aggregated Parties' : 'Summary'}
            </strong>

            {!isDistrictView && (
              <ul className="plain-list">
                {Object.entries(result.summary || {}).map(([key, value]) => (
                  <li key={key}>
                    {key}: <strong>{value}</strong>
                  </li>
                ))}
              </ul>
            )}

            {isDistrictView && (
              <div className="totals-line">
                Total Votes: <strong>{totalVotes.toLocaleString()}</strong>
              </div>
            )}
          </div>

          {/* Right side - Top party */}
          <div className="summary-block">
            <strong>Top Party</strong>
            {topParty && (
              <div className="top-party">
                <span
                  className="party-swatch"
                  style={{ background: getPartyColor(topParty.party_code) }}
                />
                {topParty.party_code} {topParty.party_name}
                ({topParty.votes.toLocaleString()} votes)
              </div>
            )}
          </div>

        </div>

        {/* Parties table */}
        <h3 className="subheading">Parties</h3>
        <table className="tight-table">
          <thead>
            <tr>
              <th align="left">Code</th>
              <th align="left">Party</th>
              <th align="right">Votes</th>
            </tr>
          </thead>
          <tbody>
            {sortedParties.map((party) => (
              <tr key={party.party_code}>
                <td>
                  <span
                    className="party-swatch sm"
                    style={{ background: getPartyColor(party.party_code) }}
                  />
                  {party.party_code}
                </td>
                <td>{party.party_name}</td>
                <td align="right" className="mono">
                  {party.votes.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Divisions coverage - only for district view */}
        {isDistrictView && (
          <>
            <h3 className="subheading">Divisions Coverage</h3>
            <div className="divisions-list">
              {result.divisionCodes.map((code) => {
                const isReported = result.reportedDivisions.includes(code);
                return (
                  <span
                    key={code}
                    className={
                      isReported
                        ? 'division-chip reported'
                        : 'division-chip pending'
                    }
                  >
                    {code}
                    {!isReported && '*'}
                  </span>
                );
              })}
            </div>
            <p className="pending-note">* awaiting result</p>
          </>
        )}

      </div>
    </div>
  );
}
