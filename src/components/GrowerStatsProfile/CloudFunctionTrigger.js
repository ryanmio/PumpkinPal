import React, { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import Spinner from '../Spinner';
import { toast } from 'react-hot-toast';

const CloudFunctionTrigger = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  
  const functionsList = [
    { name: 'calculateGlobalRankings', url: 'https://us-central1-pumpkinpal-b60be.cloudfunctions.net/calculateGlobalRankings' },
    { name: 'calculateCountryRankings', url: 'https://us-central1-pumpkinpal-b60be.cloudfunctions.net/calculateCountryRankings' },
    { name: 'calculateStateRankings', url: 'https://us-central1-pumpkinpal-b60be.cloudfunctions.net/calculateStateRankings' },
    { name: 'calculateSiteRecords', url: 'https://us-central1-pumpkinpal-b60be.cloudfunctions.net/calculateSiteRecords' },
    { name: 'calculateLifetimeBestRank', url: 'https://us-central1-pumpkinpal-b60be.cloudfunctions.net/calculateLifetimeBestRank' },
    { name: 'calculateGrowerRankings', url: 'https://us-central1-pumpkinpal-b60be.cloudfunctions.net/calculateGrowerRankings' },
    { name: 'calculateGrowerMetrics', url: 'https://us-central1-pumpkinpal-b60be.cloudfunctions.net/calculateGrowerMetrics' },
    { name: 'calculateContestPopularityRanking', url: 'https://us-central1-pumpkinpal-b60be.cloudfunctions.net/calculateContestPopularityRanking' },
  ];
  
  const handleTrigger = async (functionUrl) => {
    setLoading(true);
    
    try {
      const result = await axios.get(functionUrl);
      setLogs(logs => [...logs, result.data]);
      toast.success('Function execution completed.');
    } catch (error) {
      console.error('Error triggering function:', error);
      toast.error('Error triggering function.');
    }
    
    setLoading(false);
  };

  if (loading) {
    return <Spinner />;
  }

  if (user?.email !== 'ryan@mioduski.us') {
    return <p>Only the owner can access this page.</p>;
  }

  return (
    <div>
      {functionsList.map((func, index) => (
        <button key={index} onClick={() => handleTrigger(func.url)}>Run {func.name}</button>
      ))}
      
      <h2>Logs:</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default CloudFunctionTrigger;
