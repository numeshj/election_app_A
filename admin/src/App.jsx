import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Header from './components/Header';
import Footer from './components/Footer';
import EntryForm from './components/EntryForm';
import HistoryView from './components/HistoryView';
import CoverageView from './components/CoverageView';
import DetailOverlay from './components/DetailOverlay';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function App() {
  const [currentView, setCurrentView] = useState('entry');
  const [results, setResults] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  // Load data when app starts
  useEffect(() => {
    loadData();
    connectToServer();
  }, []);

  const loadData = async () => {
    try {
      const [resultsRes, districtsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/results`),
        axios.get(`${API_BASE}/api/districts`)
      ]);
      setResults(resultsRes.data);
      setDistricts(districtsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const connectToServer = () => {
    const socket = io(API_BASE);
    socket.on('results:all', (data) => setResults(data));
    socket.on('result:new', (result) => {
      setResults(prev => [...prev, result]);
    });
  };

  const handleResultSubmit = async (resultData) => {
    try {
      await axios.post(`${API_BASE}/api/results`, resultData);
      alert('Result saved successfully!');
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Error saving result');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'entry':
        return <EntryForm onSubmit={handleResultSubmit} />;
      case 'history':
        return <HistoryView results={results} onSelectResult={setSelectedResult} />;
      case 'coverage':
        return <CoverageView results={results} districts={districts} onSelectResult={setSelectedResult} />;
      default:
        return <EntryForm onSubmit={handleResultSubmit} />;
    }
  };

  return (
    <div className="app">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="main-content">
        {renderCurrentView()}
      </main>

      <Footer />

      {selectedResult && (
        <DetailOverlay
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
}
