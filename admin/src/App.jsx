import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import EntryForm from './components/EntryForm';
import HistoryView from './components/HistoryView';
import CoverageView from './components/CoverageView';
import DetailOverlay from './components/DetailOverlay';
import Notification from './components/Notification';
import districtsData from './data/districts.json';
import './styles.css';

const WS_URL = 'ws://localhost:4001';

export default function App() {
  const [currentView, setCurrentView] = useState('entry');
  const [results, setResults] = useState([]);      // all submitted results
  const [districts] = useState(districtsData); // loaded locally 
  const [selectedResult, setSelectedResult] = useState(null);
  const [notification, setNotification] = useState(null); // { message, type }
  const [importedJsonList, setImportedJsonList] = useState([]); // array of imported JSON objects
  const socketRef = useRef(null);
  // Connect once when component mounts
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      // Ask for all data (optional, since server already sends snapshot)
      ws.send(JSON.stringify({ type: 'request:all' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'results:all') setResults(msg.data || []);
        if (msg.type === 'result:new') setResults(prev => [...prev, msg.data]);
        if (msg.type === 'result:updated') {
          setResults(prev => prev.map(r => r.id === msg.data.id ? msg.data : r));
        }
      } catch {/* ignore */ }
    };

    ws.onclose = () => {
      socketRef.current = null;
      console.warn('WebSocket closed');
    };

    return () => ws.close();
  }, []);

  // Send a new / updated result to server via WS
  const handleResultSubmit = (resultData) => {
    if (!socketRef.current || socketRef.current.readyState !== 1) {
      setNotification({ message: 'Not connected to server', type: 'error' });
      return;
    }
    socketRef.current.send(JSON.stringify({ type: 'submit', payload: resultData }));
    setNotification({ message: 'Result submitted successfully!', type: 'success' });
  };

  // Handle multiple JSON file imports
  const handleImportJSON = async (files) => {
    if (!files || files.length === 0) return;
    const parsed = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) continue;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        data.__fileName = file.name;
        parsed.push(data);
      } catch {
        setNotification({ message: `Failed to parse ${file.name}`, type: 'error' });
      }
    }
    if (parsed.length === 0) return;
    setImportedJsonList(prev => [...prev, ...parsed]);
    setNotification({ message: `Imported ${parsed.length} file(s)`, type: 'success' });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'entry':
  return <EntryForm onSubmit={handleResultSubmit} externalImports={importedJsonList} />;
      case 'history':
        return <HistoryView results={results} onSelectResult={setSelectedResult} />;
      case 'coverage':
        return <CoverageView results={results} districts={districts} onSelectResult={setSelectedResult} />;
      default:
  return <EntryForm onSubmit={handleResultSubmit} externalImports={importedJsonList} />;
    }
  };

  return (
    <div className="app">
      <Header currentView={currentView} onViewChange={setCurrentView} onImport={handleImportJSON} />

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

      <Notification
        message={notification?.message}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
