import React from 'react';
import { Line } from 'react-chartjs-2';

const GraphCard = ({ measurements, pumpkinName }) => {

  // Helper function to format a date string as Month D, YYYY
  function formatDate(dateString) {
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return utcDate.toLocaleDateString(undefined, options);
  }

  // Prepare the data for the chart
  const chartData = {
    labels: measurements?.map(m => formatDate(m.timestamp)),
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

  const options = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto">
      <h3 className="text-xl font-bold mb-2">{pumpkinName} Weight Trend</h3>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default GraphCard;
