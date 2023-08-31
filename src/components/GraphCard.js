import React, { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import FullscreenIcon from './icons/FullscreenIcon';

const GraphCard = ({ measurements, pumpkinName }) => {
  const graphCardRef = useRef(null);

  const toggleFullscreen = () => {
    const elem = graphCardRef.current;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
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
          day: 'MMM d'  // Changed 'D' to 'd'
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
  <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto" ref={graphCardRef}>
    <button onClick={toggleFullscreen}>
    <FullscreenIcon alt="Toggle Fullscreen" />
    </button>
    <h3 className="text-xl font-bold mb-2">{pumpkinName} Weight Trend</h3>
    <Line data={chartData} options={options} />
  </div>
);
};

export default GraphCard;