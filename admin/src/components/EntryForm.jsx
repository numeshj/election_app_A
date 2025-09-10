import React, { useState } from 'react';
import './EntryForm.css';

function EntryForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    timestamp: '',
    level: '',
    ed_code: '',
    ed_name: '',
    pd_code: '',
    pd_name: '',
    type: 'PRESIDENTIAL-FIRST',
    sequence_number: '',
    reference: '',
    summary: {
      valid: 0,
      rejected: 0,
      polled: 0,
      electors: 0
    },
    by_party: []
  });

  const [partyInput, setPartyInput] = useState({
    party_code: '',
    votes: 0,
    percentage: 0,
    party_name: '',
    candidate: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSummaryChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      summary: {
        ...prev.summary,
        [field]: Number(value)
      }
    }));
  };

  const handlePartyInputChange = (field, value) => {
    setPartyInput(prev => ({
      ...prev,
      [field]: field === 'votes' || field === 'percentage' ? Number(value) : value
    }));
  };

  const addParty = () => {
    if (!partyInput.party_code) return;

    setFormData(prev => ({
      ...prev,
      by_party: [...prev.by_party, partyInput]
    }));

    setPartyInput({
      party_code: '',
      votes: 0,
      percentage: 0,
      party_name: '',
      candidate: ''
    });
  };

  const removeParty = (partyCode) => {
    setFormData(prev => ({
      ...prev,
      by_party: prev.by_party.filter(party => party.party_code !== partyCode)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Calculate percentages if not provided
    const totalVotes = formData.by_party.reduce((sum, party) => sum + party.votes, 0);
    const updatedParties = formData.by_party.map(party => ({
      ...party,
      percentage: totalVotes > 0 ? Number(((party.votes / totalVotes) * 100).toFixed(2)) : 0
    }));

    const resultData = {
      ...formData,
      by_party: updatedParties
    };

    onSubmit(resultData);
  };

  const isFormValid = formData.timestamp && formData.ed_code && formData.ed_name &&
                     formData.type && formData.sequence_number && formData.by_party.length > 0;

  return (
    <div className="entry-form">
      <h2>Enter Election Result</h2>

      <form onSubmit={handleSubmit}>
        {/* Metadata Section */}
        <section className="form-section">
          <h3>Metadata</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Timestamp:</label>
              <input
                type="text"
                value={formData.timestamp}
                onChange={(e) => handleInputChange('timestamp', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Level:</label>
              <input
                type="text"
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>District Code:</label>
              <input
                type="text"
                value={formData.ed_code}
                onChange={(e) => handleInputChange('ed_code', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>District Name:</label>
              <input
                type="text"
                value={formData.ed_name}
                onChange={(e) => handleInputChange('ed_name', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Division Code:</label>
              <input
                type="text"
                value={formData.pd_code}
                onChange={(e) => handleInputChange('pd_code', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Division Name:</label>
              <input
                type="text"
                value={formData.pd_name}
                onChange={(e) => handleInputChange('pd_name', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Type:</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                required
              >
                <option value="PRESIDENTIAL-FIRST">Presidential First</option>
                <option value="PRESIDENTIAL-SECOND">Presidential Second</option>
                <option value="PARLIAMENTARY">Parliamentary</option>
              </select>
            </div>
            <div className="form-field">
              <label>Sequence Number:</label>
              <input
                type="text"
                value={formData.sequence_number}
                onChange={(e) => handleInputChange('sequence_number', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Reference:</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Summary Section */}
        <section className="form-section">
          <h3>Summary</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Valid Votes:</label>
              <input
                type="number"
                value={formData.summary.valid}
                onChange={(e) => handleSummaryChange('valid', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Rejected Votes:</label>
              <input
                type="number"
                value={formData.summary.rejected}
                onChange={(e) => handleSummaryChange('rejected', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Polled Votes:</label>
              <input
                type="number"
                value={formData.summary.polled}
                onChange={(e) => handleSummaryChange('polled', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Electors:</label>
              <input
                type="number"
                value={formData.summary.electors}
                onChange={(e) => handleSummaryChange('electors', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Parties Section */}
        <section className="form-section">
          <h3>Parties ({formData.by_party.length})</h3>

          {/* Add Party Form */}
          <div className="party-input-form">
            <div className="form-grid">
              <div className="form-field">
                <label>Party Code:</label>
                <input
                  type="text"
                  value={partyInput.party_code}
                  onChange={(e) => handlePartyInputChange('party_code', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Party Name:</label>
                <input
                  type="text"
                  value={partyInput.party_name}
                  onChange={(e) => handlePartyInputChange('party_name', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Votes:</label>
                <input
                  type="number"
                  value={partyInput.votes}
                  onChange={(e) => handlePartyInputChange('votes', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Candidate:</label>
                <input
                  type="text"
                  value={partyInput.candidate}
                  onChange={(e) => handlePartyInputChange('candidate', e.target.value)}
                />
              </div>
            </div>
            <button type="button" className="btn add-party-btn" onClick={addParty}>
              Add Party
            </button>
          </div>

          {/* Parties Table */}
          {formData.by_party.length > 0 && (
            <div className="parties-table">
              <table>
                <thead>
                  <tr>
                    <th>Party Code</th>
                    <th>Party Name</th>
                    <th>Votes</th>
                    <th>%</th>
                    <th>Candidate</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.by_party.map((party, index) => (
                    <tr key={party.party_code + index}>
                      <td>{party.party_code}</td>
                      <td>{party.party_name}</td>
                      <td>{party.votes}</td>
                      <td>{party.percentage}%</td>
                      <td>{party.candidate}</td>
                      <td>
                        <button
                          type="button"
                          className="btn remove-btn"
                          onClick={() => removeParty(party.party_code)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="btn submit-btn" disabled={!isFormValid}>
            Submit Result
          </button>
        </div>
      </form>
    </div>
  );
}

export default EntryForm;
