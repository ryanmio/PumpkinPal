import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Line } from 'react-chartjs-2';

function PumpkinDetail() {
  const { id } = useParams();
  const [pumpkin, setPumpkin] = useState(null);
  const navigate = useNavigate();

  // Define a Firestore query to retrieve the pumpkin's measurements ordered by timestamp
  const measurementsQuery = query(collection(db, 'Users', auth.currentUser?.uid, 'Pumpkins', id, 'Measurements'), orderBy('timestamp'));
  
  // Subscribe to the measurements in real time
  const [measurements] = useCollectionData(measurementsQuery, { idField: 'id' });

  // Fetch the pumpkin data
  useEffect(() => {
    const fetchPumpkin = async () => {
      if(auth.currentUser) {
        const docRef = doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPumpkin(docSnap.data());
        }
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
        label: 'Estimated Weight over Time',
        data: measurements?.map(m => m.estimatedWeight),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <div>
      <h2>Pumpkin Detail</h2>
      <p>Name: {pumpkin?.name}</p>
      <p>Description: {pumpkin?.description}</p>
      <button onClick={() => navigate(`/edit-pumpkin/${id}`)}>Edit Pumpkin</button>
      <button onClick={() => navigate(`/add-measurement/${id}`)}>Add Measurement</button>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>End to End</th>
            <th>Side to Side</th>
            <th>Circumference</th>
            <th>Estimated Weight</th>
          </tr>
        </thead>
        <tbody>
          {measurements && measurements.map(measurement => (
            <tr key={measurement.id}>
              <td>{new Date(measurement.timestamp.seconds * 1000).toLocaleDateString()}</td>
              <td>{measurement.endToEnd}</td>
              <td>{measurement.sideToSide}</td>
              <td>{measurement.circumference}</td>
              <td>{measurement.estimatedWeight}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Line data={chartData} />
    </div>
  );
}

export default PumpkinDetail;
