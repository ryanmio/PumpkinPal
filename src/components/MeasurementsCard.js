import React from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast, Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

const MeasurementsCard = ({ measurements, pumpkin, pumpkinId }) => {
  const navigate = useNavigate();

  const deleteMeasurement = async (measurementId) => {
  Swal.fire({
    title: 'Are you sure you want to delete this measurement?',
    text: "You won't be able to undo this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Delete'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        if (auth.currentUser && auth.currentUser.uid && pumpkinId && measurementId) {
          const measurementPath = `Users/${auth.currentUser.uid}/Pumpkins/${pumpkinId}/Measurements/${measurementId}`;
          await deleteDoc(doc(db, measurementPath));
          toast.success("Measurement deleted successfully.");
        } else {
          throw new Error("Missing required parameters.");
        }
      } catch (error) {
        console.error("Error deleting measurement: ", error);
        toast.error("Failed to delete measurement. Please try again.");
      }
    }
  })
};


  const exportData = async () => {
    toast('Exporting...', { id: 'exporting' }); // Start with an "Exporting..." toast
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
        toast.dismiss('exporting'); // Dismiss the "Exporting..." toast
        toast.success("Export successful!"); // Show a success toast
    }).catch(e => {
      console.error(e);
      toast.dismiss('exporting'); // Dismiss the "Exporting..." toast
      toast.error("An error occurred during export."); // Show an error toast
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
