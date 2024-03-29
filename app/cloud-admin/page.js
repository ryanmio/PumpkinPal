'use client'
// app/cloud-admin/page.js
import React, { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import { toast } from 'react-hot-toast';

const CloudFunctionTrigger = () => {
  const { user } = useContext(UserContext);
  const [logs, setLogs] = useState([]);
  const [triggeredFunctions, setTriggeredFunctions] = useState({});
  
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
  
  const handleTrigger = async (functionUrl, functionName) => {
    toast(`Running ${functionName}`);
    setTriggeredFunctions({ ...triggeredFunctions, [functionName]: true });
    
    try {
      const result = await axios.get(functionUrl);
      setLogs(logs => [...logs, `Success: ${functionName} completed with data: ${result.data}`]);
      toast.success('Function execution completed.');
    } catch (error) {
      console.error('Error triggering function:', error);
      setLogs(logs => [...logs, `Error: ${functionName} failed with message: ${error.message}`]);
      toast.error('Error triggering function.');
    }
  };

  if (user?.email !== 'ryan@mioduski.us') {
    return <p>Only the owner can access this page.</p>;
  }

  return (
    <div className="h-screen flex justify-start flex-col items-center">
      <div className="container mx-auto px-4 pt-10 flex flex-col space-y-4 bg-white shadow rounded-lg p-4 max-w-5xl w-full grid grid-cols-3 gap-4">
        <div>
          {functionsList.map((func, index) => (
            <button 
              className={`w-full font-bold py-2 px-4 rounded mt-4 mb-4 ${triggeredFunctions[func.name] ? "bg-green-500 hover:bg-green-700" : "bg-blue-500 hover:bg-blue-700"} text-white`}
              key={index} 
              onClick={() => handleTrigger(func.url, func.name)}>
              Run {func.name}
            </button>
          ))}
        </div>
        <div className="col-span-2">
          <h2 className="text-xl font-bold mb-2">Logs:</h2>
          <ul className="border border-gray-300 rounded-md p-4 bg-gray-100 overflow-y-auto h-80">
            {logs.map((log, index) => (
              <li key={index} className="mb-2">{log}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CloudFunctionTrigger;