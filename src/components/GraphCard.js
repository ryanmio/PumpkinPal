import React from 'react';
import { Line } from 'react-chartjs-2';

function GraphCard({ measurements }) {

  // Prepare the data for the chart
  const chartData = {
    labels: measurements?.map(m => m.timestamp),
    datasets: [
      {
        label: 'Estimated Weight over Time (lbs)',
        data: measurements?.map(m => m.estimatedWeight),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 mb-10">
      <h3 className="text-xl font-bold mb-2">Graph</h3>
      <Line data={chartData} />
    </div>
  );
};

export default GraphCard;
