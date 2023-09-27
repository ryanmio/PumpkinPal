import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast, Toaster } from 'react-hot-toast';
import { showDeleteConfirmation } from './Alert';
import { trackError, trackUserEvent, GA_CATEGORIES, GA_ACTIONS } from '../utilities/error-analytics';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

const MeasurementsCard = ({ measurements, pumpkin, pumpkinId, pollinationDate }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const deleteMeasurement = async (measurementId) => {
    showDeleteConfirmation('Are you sure you want to delete this measurement?', "You won't be able to undo this.", async () => {
      try {
        if (auth.currentUser?.uid && pumpkinId && measurementId) {
          const measurementPath = `Users/${auth.currentUser.uid}/Pumpkins/${pumpkinId}/Measurements/${measurementId}`;
          await deleteDoc(doc(db, measurementPath));
          toast.success("Measurement deleted successfully.");
          trackUserEvent(GA_ACTIONS.DELETE_MEASUREMENT, 'MeasurementsCard - Successful Delete');
        } else {
          throw new Error("Missing required parameters.");
        }
      } catch (error) {
        console.error("Error deleting measurement: ", error);
        toast.error("Failed to delete measurement. Please try again.");
        trackError(error, 'MeasurementsCard - Failed Delete', GA_CATEGORIES.USER, GA_ACTIONS.ERROR);
      }
    });
  };

  const exportData = async () => {
    toast('Exporting...', { id: 'exporting' });
    const idToken = await auth.currentUser?.getIdToken();

    fetch(`https://us-central1-pumpkinpal-b60be.cloudfunctions.net/exportData?pumpkinId=${pumpkinId}&timeZone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`, {
      headers: {
        'Authorization': 'Bearer ' + idToken
      }
    }).then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // Format the current date as YYYY-MM-DD
        const date = new Date().toISOString().slice(0, 10);
        a.download = `PumpkinPal_${pumpkin.name}_${date}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success("Export successful!");
        trackUserEvent(GA_ACTIONS.EXPORT_DATA, 'MeasurementsCard - Successful Export');
      }).catch(e => {
        console.error(e);
        toast.dismiss();
        toast.error("An error occurred during export.");
        trackError(e, 'MeasurementsCard - Failed Export', GA_CATEGORIES.USER, GA_ACTIONS.ERROR);
      });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto">
      <Toaster />
      <h3 className="text-xl font-bold mb-2">Measurements</h3>
      <div className="flex space-x-4 justify-center">
        <button onClick={() => navigate(`/add-measurement/${pumpkinId}`)} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Add Measurement</button>
        <button onClick={exportData} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Export Data</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full mt-4">
          <thead>
            <tr>
              <th className="whitespace-nowrap min-w-max w-[100px] table-cell">Date</th>
              <th className="table-cell">DAP</th>
              <th className="table-cell">End to End</th>
              <th className="table-cell">Side to Side</th>
              <th className="table-cell">Circ.</th>
              <th className="table-cell">Units</th>
              <th className="table-cell">OTT Weight</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
          {measurements?.slice(0, isExpanded ? measurements.length : 6)?.map((measurement) => {
          const measurementDate = new Date(measurement.timestamp);
          const pollinationDateObj = pollinationDate ? new Date(pollinationDate) : null; // Check if pollinationDate is set
          const dap = pollinationDateObj ? Math.round((measurementDate - pollinationDateObj) / (1000 * 60 * 60 * 24)) : '-'; // If pollinationDate is not set, dap is '-'
          return (
              <tr key={measurement.id}>
                <td className="whitespace-nowrap table-cell">{measurement.timestamp}</td>
                <td className="table-cell">{dap}</td>
                <td className="table-cell">{measurement.endToEnd}</td>
                <td className="table-cell">{measurement.sideToSide}</td>
                <td className="table-cell">{measurement.circumference}</td>
                <td className="table-cell">{measurement.measurementUnit}</td>
                <td className="table-cell">{measurement.estimatedWeight}</td>
                <td><button onClick={() => navigate(`/edit-measurement/${pumpkinId}/${measurement.id}`)} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Edit</button></td>
                <td><button onClick={() => deleteMeasurement(measurement.id)} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Delete</button></td>
              </tr>
            );
        })}
          </tbody>
        </table>
        </div>
        {measurements?.length > 6 && (
          <div className="mt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`green-button inline-flex items-center justify-center px-4 py-1 text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                isExpanded ? 'mb-4' : ''
              }`}
            >
              {isExpanded ? (
                <>
                  <BsChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <BsChevronDown className="w-4 h-4 mr-1" />
                  Show More
                </>
              )}
            </button>
          </div>
        )}
      </div>
  );
};

export default MeasurementsCard;