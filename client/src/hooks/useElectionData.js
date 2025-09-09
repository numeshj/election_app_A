// Loads static districts & sample results (frontend-only mode)
import { useState, useEffect } from 'react';
import districtsData from '../data/districts.json';
import sampleResults from '../data/results.sample.json';

export function useElectionData(){
  const [districts, setDistricts] = useState([]);
  const [results, setResults] = useState([]);
  useEffect(()=> {
    setDistricts(districtsData||[]);
    setResults(sampleResults||[]);
  },[]);
  return { districts, results };
}
