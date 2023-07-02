import React from 'react';
import { Line } from 'react-chartjs-2';

function GraphCard({ chartData }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 mb-10">
      <h3 className="text-xl font-bold mb-2">Graph</h3>
      <Line data={chartData} />
    </div>
  );
};

export default GraphCard;
