import React from 'react';
import './Header.css';

function Header({ currentView, onViewChange }) {
  const tabs = [
    { key: 'entry', label: 'Enter Result' },
    { key: 'history', label: 'History' },
    { key: 'coverage', label: 'Coverage' }
  ];

  return (
    <header className="header">
      <div className="logo">Election Admin</div>
      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${currentView === tab.key ? 'active' : ''}`}
            onClick={() => onViewChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <nav className="top-actions">
        <button className="btn ghost">Import JSON</button>
      </nav>
    </header>
  );
}

export default Header;
