import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, doc, getDoc, query, orderBy, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
const [alert, setAlert] = useState(null);

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
  setTimeout(() => setAlert(null), 3000);
  const idToken = await auth.currentUser.getIdToken();

  fetch('https://us-central1-pumpkinpal-b60be.cloudfunctions.net/exportData?pumpkinId=' + id, {
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
  }).catch(e => console.error(e));
};


  return (
    <div>
      <h2>Pumpkin Detail</h2>
      <p>Name: {pumpkin?.name}</p>
      <p>Description: {pumpkin?.description}</p>
      <button onClick={() => navigate(`/edit-pumpkin/${id}`)}>Edit Pumpkin</button>
      <h3>Measurements</h3>
      <button onClick={() => navigate(`/add-measurement/${id}`)}>Add Measurement</button>
      <button onClick={exportData}>Export Data</button>
      <div>
    {alert && <div className="alert">{alert}</div>}
      <table>
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
              <td><button onClick={() => navigate(`/edit-measurement/${id}/${measurement.id}`)}>Edit</button></td>
              <td><button onClick={() => deleteMeasurement(measurement.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Line data={chartData} />
    </div>
  );
}

export default PumpkinDetail;
