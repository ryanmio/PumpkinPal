import React from 'react';
import { Line } from 'react-chartjs-2';

const GraphCard = ({ measurements, pumpkinName }) => {

  // Prepare the data for the chart
  const chartData = {
    labels: measurements?.map(m => new Date(m.timestamp)),
    datasets: [
      {
        label: 'OTT Weight by Date (lbs)',
        data: measurements?.map(m => m.estimatedWeight),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM D, YYYY'
          }
        },
        ticks: {
          source: 'data',
        }
      },
      y: {
        min: 0,
      },
    },
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto mb-12">
      <h3 className="text-xl font-bold mb-2">{pumpkinName} Weight Trend</h3>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default GraphCard;
