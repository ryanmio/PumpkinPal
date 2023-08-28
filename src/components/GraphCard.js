import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

const GraphCard = ({ measurements, pumpkinName }) => {

  // Helper function to format a date string as Month D, YYYY
  function formatDate(dateString) {
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return utcDate.toLocaleDateString(undefined, options);
  }

  // Memoize formatted dates
  const formattedDates = useMemo(() => {
    return measurements?.map(m => formatDate(m.timestamp));
  }, [measurements]);

  // Prepare the data for the chart
  const chartData = {
    labels: formattedDates,
    datasets: [
      {
        label: 'OTT Weight by Date (lbs)',
        data: measurements?.map(m => m.estimatedWeight),
        fill: false,
        backgroundColor: '#fb9336',  // Brand color for background
        borderColor: '#df6139',      // Brand color for border
      },
    ],
  };

  const options = {
    scales: {
      y: {
        min: 0,
      },
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
