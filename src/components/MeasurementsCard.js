import React from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const MeasurementsCard = ({ measurements, pumpkin, pumpkinId, setAlert }) => {
  const navigate = useNavigate();

const deleteMeasurement = async (measurementId) => {
  if (window.confirm("Are you sure you want to delete this measurement?")) {
    try {
      if (auth.currentUser && auth.currentUser.uid && pumpkinId && measurementId) {
        const measurementPath = `Users/${auth.currentUser.uid}/Pumpkins/${pumpkinId}/Measurements/${measurementId}`;
        await deleteDoc(doc(db, measurementPath));
        setAlert({ type: "success", message: "Measurement deleted successfully." });
      } else {
        throw new Error("Missing required parameters.");
      }
    } catch (error) {
      console.error("Error deleting measurement: ", error);
      setAlert({ type: "error", message: "Failed to delete measurement. Please try again." });
    }
  }
};

const exportData = async () => {
  setAlert({ type: "info", message: "Exporting..." });
  const idToken = await auth.currentUser.getIdToken();

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
      setAlert(null);  // Clear the alert after the export is complete
  }).catch(e => {
    console.error(e);
    setAlert({ type: "error", message: "An error occurred during export." });
  });
};


  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto">
      <h3 className="text-xl font-bold mb-2">Measurements</h3>
      <div className="flex space-x-4 justify-center">
        <button onClick={() => navigate(`/add-measurement/${pumpkinId}`)} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Add Measurement</button>
        <button onClick={exportData} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Export Data</button>
      </div>
      {alert && <div className={`alert ${alert.type}`}>{alert.message}</div>}
      <div className="overflow-x-auto">
        <table className="w-full mt-4">
          <thead>
            <tr>
              <th className="whitespace-nowrap min-w-max w-[100px] table-cell">Date</th>
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
            {measurements && measurements.map(measurement => (
              <tr key={measurement.id}>
                <td className="whitespace-nowrap table-cell">{measurement.timestamp}</td>
                <td className="table-cell">{measurement.endToEnd}</td>
                <td className="table-cell">{measurement.sideToSide}</td>
                <td className="table-cell">{measurement.circumference}</td>
                <td className="table-cell">{measurement.measurementUnit}</td>
                <td className="table-cell">{measurement.estimatedWeight}</td>
                <td><button onClick={() => navigate(`/edit-measurement/${pumpkinId}/${measurement.id}`)} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Edit</button></td>
                <td><button onClick={() => deleteMeasurement(measurement.id)} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MeasurementsCard;
