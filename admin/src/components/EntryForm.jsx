import React, { useState } from 'react';
import Notification from './Notification';
import './EntryForm.css';

function EntryForm({ onSubmit, externalImports = [] }) {
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

  const [importedFiles, setImportedFiles] = useState([]); // Store multiple imported files
  const [notification, setNotification] = useState(null);

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

    // Clear form after successful submission
    setFormData({
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

    // Clear imported files if all are submitted
    const allSubmitted = importedFiles.every(f => f.status === 'submitted');
    if (allSubmitted) {
      setImportedFiles([]);
    }

    setNotification({ message: 'Result submitted successfully!', type: 'success' });
  };

  // If externalImport (from Header) changes, load it like a single imported file
  // Sync externalImports from parent (Header import) into local importedFiles
  React.useEffect(() => {
    if (!externalImports || externalImports.length === 0) return;
    setImportedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      const additions = externalImports
        .filter(d => !existingNames.has(d.__fileName || 'import.json'))
        .map((d, idx) => ({
          id: `ext-${Date.now()}-${idx}`,
            name: d.__fileName || `import-${idx + 1}.json`,
            data: d,
            status: idx === 0 && prev.length === 0 ? 'loaded' : 'pending'
        }));
      const merged = [...prev, ...additions];
      // Auto load first file if form is empty
      if (additions.length > 0 && merged.some(f => f.status === 'loaded')) {
        const loaded = merged.find(f => f.status === 'loaded');
        if (loaded) setFormData({ ...loaded.data });
        setNotification({ message: `Loaded ${loaded.name} into form`, type: 'success' });
      }
      return merged;
    });
  }, [externalImports]);

  const handleImportJSON = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Reset the file input so the same files can be selected again
    event.target.value = '';

    const newImportedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        continue; // Skip non-JSON files
      }

      try {
        const text = await file.text();
        const importedData = JSON.parse(text);

        newImportedFiles.push({
          id: `${file.name}-${Date.now()}-${i}`,
          name: file.name,
          data: importedData,
          status: 'pending' // pending, loaded, submitted
        });
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error);
      }
    }

    if (newImportedFiles.length > 0) {
      // Mark first file as loaded
      newImportedFiles[0].status = 'loaded';

      setImportedFiles(prev => [...prev, ...newImportedFiles]);
      setNotification({
        message: `${newImportedFiles.length} file(s) imported! First file loaded into form.`,
        type: 'success'
      });

      // Load first file data directly into form
      const firstFile = newImportedFiles[0];
      setFormData(firstFile.data);

      // Check if metadata fields are populated
      const hasMetadata = firstFile.data.timestamp && firstFile.data.ed_code &&
                         firstFile.data.ed_name && firstFile.data.type && firstFile.data.sequence_number;

      setNotification({
        message: hasMetadata
          ? `"${firstFile.name}" loaded with metadata`
          : `"${firstFile.name}" loaded (missing some metadata)`,
        type: hasMetadata ? 'success' : 'warning'
      });
    } else {
      setNotification({ message: 'No valid JSON files found.', type: 'error' });
    }
  };

  // Load a specific file into the form
  const loadFileIntoForm = (fileId) => {
    // Use setTimeout to ensure state has updated after import
    setTimeout(() => {
      const file = importedFiles.find(f => f.id === fileId);
      if (file) {
        setFormData(file.data);
        setImportedFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, status: 'loaded' } : f
        ));

        // Check if metadata fields are populated
        const hasMetadata = file.data.timestamp && file.data.ed_code &&
                           file.data.ed_name && file.data.type && file.data.sequence_number;

        setNotification({
          message: hasMetadata
            ? `"${file.name}" loaded with metadata`
            : `"${file.name}" loaded (missing some metadata)`,
          type: hasMetadata ? 'success' : 'warning'
        });
      } else {
        setNotification({ message: 'File not found in imported list', type: 'error' });
      }
    }, 100); // Small delay to ensure state update
  };

  // Submit a specific file
  const submitFile = (fileId) => {
    const file = importedFiles.find(f => f.id === fileId);
    if (file) {
      onSubmit(file.data);
      // remove file from list after submit
      setImportedFiles(prev => prev.filter(f => f.id !== fileId));

      // Clear form after submitting
      setFormData({
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

      setNotification({ message: `"${file.name}" submitted successfully!`, type: 'success' });
    }
  };

  // Remove a specific file
  const removeFile = (fileId) => {
    const file = importedFiles.find(f => f.id === fileId);
    setImportedFiles(prev => prev.filter(f => f.id !== fileId));
    if (file) {
      setNotification({ message: `"${file.name}" removed`, type: 'info' });
    }
  };

  // Submit all files
  const submitAllFiles = () => {
  const pendingFiles = [...importedFiles];
  pendingFiles.forEach(file => onSubmit(file.data));
  // clear all after submit all
  setImportedFiles([]);

    // Clear form after submitting all
    setFormData({
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

    setNotification({
      message: `All ${pendingFiles.length} file(s) submitted successfully!`,
      type: 'success'
    });
  };

  // Check if metadata is valid for import
  const isMetadataValid = formData.timestamp && formData.ed_code && formData.ed_name && formData.type && formData.sequence_number;

  // Check if import should be disabled (only when files already imported)
  const isImportDisabled = importedFiles.length > 0;

  // Check if form is valid for submission
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
          <div className="import-section">
            <input
              type="file"
              accept=".json"
              multiple
              onChange={handleImportJSON}
              style={{ display: 'none' }}
              id="json-import"
              disabled={isImportDisabled}
            />
            <label
              htmlFor="json-import"
              className={`btn import-btn ${isImportDisabled ? 'disabled' : ''}`}
              title={
                importedFiles.length > 0
                  ? 'Clear imported files first'
                  : 'Import JSON files'
              }
            >
              Import JSON Files
            </label>
            {isImportDisabled && (
              <div className="import-disabled-message">
                Files already imported. Submit or clear first.
              </div>
            )}
          </div>
          <button type="submit" className="btn submit-btn" disabled={!isFormValid}>
            Submit Result
          </button>
        </div>
      </form>

      {/* Imported Files Management */}
      {importedFiles.length > 0 && (
        <div className="imported-files-section">
          <h3>Imported Files ({importedFiles.length})</h3>
          <div className="files-list">
            {importedFiles.map(file => (
              <div key={file.id} className={`file-item file-${file.status}`}>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-status">{file.status}</span>
                </div>
                <div className="file-actions">
                  <button
                    className="btn btn-small"
                    onClick={() => loadFileIntoForm(file.id)}
                    disabled={file.status === 'submitted'}
                  >
                    Load
                  </button>
                  <button
                    className="btn btn-small btn-success"
                    onClick={() => submitFile(file.id)}
                    disabled={file.status === 'submitted'}
                  >
                    Submit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => removeFile(file.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bulk-actions">
            <button
              className="btn btn-primary"
              onClick={submitAllFiles}
              disabled={importedFiles.length === 0}
            >
              Submit All Files
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setImportedFiles([]);
                // Clear form when clearing files
                setFormData({
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
                setNotification({ message: 'All files cleared', type: 'info' });
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      <Notification
        message={notification?.message}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}

export default EntryForm;
