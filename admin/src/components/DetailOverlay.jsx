import React from 'react';
import './DetailOverlay.css';

function DetailOverlay({ result, onClose }) {
  if (!result) return null;

  const sortedParties = [...(result.by_party || [])].sort((a, b) => b.votes - a.votes);
  const totalVotes = sortedParties.reduce((sum, party) => sum + (party.votes || 0), 0);

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-header">
          <h2 className="overlay-title">
            {result.ed_name}
            {result.pd_name && ` • ${result.pd_name}`}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="overlay-meta">
          <div className="meta-item">
            <span className="meta-label">Sequence:</span>
            <span className="meta-value">{result.sequence_number || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Reference:</span>
            <span className="meta-value">{result.reference || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Type:</span>
            <span className="meta-value">{result.type}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Submitted:</span>
            <span className="meta-value">{new Date(result.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="overlay-summary">
          <h3>Summary</h3>
          <div className="summary-grid">
            {Object.entries(result.summary || {}).map(([key, value]) => (
              <div key={key} className="summary-item">
                <span className="summary-label">{key}:</span>
                <span className="summary-value">{value}</span>
              </div>
            ))}
            <div className="summary-item total-votes">
              <span className="summary-label">Total Party Votes:</span>
              <span className="summary-value">{totalVotes.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="overlay-parties">
          <h3>Parties</h3>
          <div className="parties-table-container">
            <table className="parties-table">
              <thead>
                <tr>
                  <th>Party Code</th>
                  <th>Party Name</th>
                  <th>Votes</th>
                  <th>Percentage</th>
                  <th>Candidate</th>
                </tr>
              </thead>
              <tbody>
                {sortedParties.map((party, index) => (
                  <tr key={party.party_code + index} className={index === 0 ? 'winner-row' : ''}>
                    <td className="party-code">{party.party_code}</td>
                    <td className="party-name">{party.party_name}</td>
                    <td className="votes">{(party.votes || 0).toLocaleString()}</td>
                    <td className="percentage">{party.percentage || 0}%</td>
                    <td className="candidate">{party.candidate || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overlay-raw-data">
          <h3>Raw JSON Data</h3>
          <div className="json-container">
            <pre className="json-data">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailOverlay;
