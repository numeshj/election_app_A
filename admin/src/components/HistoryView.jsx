import React from 'react';
import './HistoryView.css';

function HistoryView({ results, onSelectResult }) {
  const sortedResults = [...results].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="history-view">
      <h2>Submitted Results</h2>
      <p className="results-count">Total: {results.length} results</p>

      {results.length === 0 ? (
        <div className="no-results">
          <p>No results submitted yet.</p>
        </div>
      ) : (
        <div className="results-list">
          {sortedResults.map((result, index) => (
            <div
              key={result.id || `${result.sequence_number}-${index}`}
              className="result-item"
              onClick={() => onSelectResult(result)}
            >
              <div className="result-header">
                <div className="result-sequence">
                  <strong>{result.sequence_number || 'N/A'}</strong>
                </div>
                <div className="result-time">
                  {new Date(result.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="result-location">
                <span className="district">{result.ed_name}</span>
                {result.pd_name && (
                  <>
                    <span className="separator">•</span>
                    <span className="division">{result.pd_name}</span>
                  </>
                )}
              </div>
              <div className="result-meta">
                <span className="type">{result.type}</span>
                <span className="reference">{result.reference || 'No reference'}</span>
              </div>
              <div className="result-parties">
                {result.by_party && result.by_party.length > 0 && (
                  <div className="top-party">
                    Top: {result.by_party[0].party_code} ({result.by_party[0].votes} votes)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryView;
