import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, doc, getDoc, query, orderBy, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';

function PumpkinDetail() {
  const { id } = useParams();
  const [pumpkin, setPumpkin] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);

  // Fetch the pumpkin data
  useEffect(() => {
    const fetchPumpkin = async () => {
      if(auth.currentUser) {
        const docRef = doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPumpkin(docSnap.data());
        }

        // Define a Firestore query to retrieve the pumpkin's measurements ordered by timestamp
        const measurementsQuery = query(collection(db, 'Users', auth.currentUser.uid, 'Pumpkins', id, 'Measurements'), orderBy('timestamp'));
  
        // Subscribe to the measurements in real time
        onSnapshot(measurementsQuery, (snapshot) => {
          let measurementData = [];
          snapshot.forEach((doc) => {
            measurementData.push({ id: doc.id, ...doc.data() });
          });
          setMeasurements(measurementData);
          // console.log("Measurements: ", measurementData);  // Check what's logged
        });
      }
    };
    auth.onAuthStateChanged((user) => {
      if (user) fetchPumpkin();
    });
  }, [id]);

  // Prepare the data for the chart
  const chartData = {
    labels: measurements?.map(m => new Date(m.timestamp.seconds * 1000).toLocaleDateString()),
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

  const deleteMeasurement = async (measurementId) => {
    if (window.confirm("Are you sure you want to delete this measurement?")) {
      try {
        if (auth.currentUser && auth.currentUser.uid && id && measurementId) {
          const measurementPath = `Users/${auth.currentUser.uid}/Pumpkins/${id}/Measurements/${measurementId}`;
          // console.log('Measurement path: ', measurementPath);
          await deleteDoc(doc(db, measurementPath));
        } else {
          throw new Error('Missing required fields for deletion');
        }
      } catch (error) {
        console.error('Error deleting measurement: ', error);
      }
    }
  };

const exportData = async () => {
  setAlert('Exporting...');
  const idToken = await auth.currentUser.getIdToken();

  fetch(`https://us-central1-pumpkinpal-b60be.cloudfunctions.net/exportData?pumpkinId=${id}&timeZone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`, {
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
    setAlert('An error occurred during export.');  // Set an error alert if the export fails
  });
};


 return (
    <div className="container mx-auto px-4 h-screen pt-10">
      <div className="bg-white shadow overflow-hidden rounded-lg p-4 w-full md:max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Pumpkin Detail</h2>

        <div className="space-y-4">
          {/* Card 1: Basic Info */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-xl font-bold mb-2">Basic Info</h3>
            <p>Name: {pumpkin?.name}</p>
            <p>Description: {pumpkin?.description}</p>
            <p>Maternal Lineage: {pumpkin?.maternalLineage}</p>
            <p>Paternal Lineage: {pumpkin?.paternalLineage}</p>
            <button onClick={() => navigate(`/edit-pumpkin/${id}`)} className="green-button">Edit Pumpkin</button>
          </div>

          {/* Card 2: Key Dates */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-xl font-bold mb-2">Key Dates</h3>
            <p>Seed Started: {new Date(pumpkin?.seedStarted.seconds * 1000).toLocaleDateString()}</p>
            <p>Transplant Out: {new Date(pumpkin?.transplantOut.seconds * 1000).toLocaleDateString()}</p>
            <p>Pollinated: {new Date(pumpkin?.pollinated.seconds * 1000).toLocaleDateString()}</p>
            <p>Weigh-off: {new Date(pumpkin?.weighOff.seconds * 1000).toLocaleDateString()}</p>
            <button onClick={() => navigate(`/edit-pumpkin/${id}`)} className="green-button">Edit Pumpkin</button>
          </div>

          {/* Card 3: Measurements */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-xl font-bold mb-2">Measurements</h3>
            <button onClick={() => navigate(`/add-measurement/${id}`)} className="green-button">Add Measurement</button>
            <button onClick={exportData} className="green-button">Export Data</button>
            {alert && <div className="alert">{alert}</div>}
            <table className="w-full mt-4 border-2 border-gray-300 rounded shadow">
          <thead>
            <tr>
              <th>Date</th>
              <th>End to End</th>
              <th>Side to Side</th>
              <th>Circumference</th>
              <th>Measurement Unit</th>
              <th>Estimated Weight</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {measurements && measurements.map(measurement => (
              <tr key={measurement.id}>
                <td>{new Date(measurement.timestamp.seconds * 1000).toLocaleDateString()}</td>
                <td>{measurement.endToEnd}</td>
                <td>{measurement.sideToSide}</td>
                <td>{measurement.circumference}</td>
                <td>{measurement.measurementUnit}</td>
                <td>{measurement.estimatedWeight}</td>
                <td><button onClick={() => navigate(`/edit-measurement/${id}/${measurement.id}`)} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Edit</button></td>
                <td><button onClick={() => deleteMeasurement(measurement.id)} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>

          {/* Card 4: Graph */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-xl font-bold mb-2">Graph</h3>
            <Line data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PumpkinDetail;