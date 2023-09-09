import React, { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import FullscreenIcon from './icons/FullscreenIcon';

const GraphCard = ({ measurements, pumpkinName, setFullscreen, isFullscreen }) => {
  const graphCardRef = useRef(null);

  const toggleFullscreen = () => {
    setFullscreen('graph');
  };

  // Helper function to return a date object
  function formatDate(dateString) {
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return utcDate;
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
        backgroundColor: '#80876E',
        borderColor: '#80876E',
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
          day: 'MMM d'
        }
      },
      title: {
        display: true,
        text: 'Date'
      }
    },
    y: {
      min: 0,
      title: {
        display: true,
        text: 'Weight (lbs)'
      }
    }
  }
};

 return (
  <div className={`bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto ${isFullscreen ? 'fullscreen' : ''}`} ref={graphCardRef}>
    <div className="flex justify-center items-start relative">
      <h3 className="text-xl font-bold mb-2">{pumpkinName} Weight Trend</h3>
      <button onClick={toggleFullscreen} className="hover:scale-110 hover:text-gray-700 transition duration-300 ease-in-out absolute right-0 top-0">
  <FullscreenIcon alt="Toggle Fullscreen" className="w-7 h-7 text-gray-500 icon-hover" />
</button>
    </div>
    <Line data={chartData} options={options} />
  </div>
);
};

export default GraphCard;