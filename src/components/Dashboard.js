import React, { useState, useEffect } from 'react';
import { auth, db, query, orderBy, limit } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDocs, deleteDoc } from 'firebase/firestore';

function Dashboard() {
  const [email, setEmail] = useState('');
  const [pumpkins, setPumpkins] = useState([]);
  const [deletionStatus, setDeletionStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        setEmail(user.email);
        const q = collection(db, 'Users', user.uid, 'Pumpkins');
        const snapshot = await getDocs(q);
        let pumpkinsData = [];

        for (let pumpkinDoc of snapshot.docs) {
            let pumpkinData = pumpkinDoc.data();

            // Query for the latest measurement
            const measurementsCollection = collection(db, 'Users', user.uid, 'Pumpkins', pumpkinDoc.id, 'Measurements');
            const measurementsQuery = query(measurementsCollection, orderBy('timestamp', 'desc'), limit(1));
            const measurementSnapshot = await getDocs(measurementsQuery);

            const latestMeasurement = measurementSnapshot.docs[0]?.data() || null;

            // Add latestMeasurement to pumpkinData
            pumpkinData.latestMeasurement = latestMeasurement;
            pumpkinsData.push({ ...pumpkinData, id: pumpkinDoc.id });
        }

        setPumpkins(pumpkinsData);
      }
    });
    return () => unsubscribe();
}, []);


  async function deletePumpkin(id) {
    if (window.confirm("Are you sure you want to delete this pumpkin?")) {
      setDeletionStatus('Deleting...');
      await deleteDoc(doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', id));
      setPumpkins(pumpkins.filter(pumpkin => pumpkin.id !== id));
      setDeletionStatus('Deleted successfully!');
      setTimeout(() => setDeletionStatus(''), 2000); // Clear status after 2 seconds
    }
  }

function daysSincePollination(pollinationDateStr) {
  const pollinationDate = new Date(pollinationDateStr);
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const now = new Date();
  const diffDays = Math.round(Math.abs((now - pollinationDate) / oneDay)) - 1;
  return diffDays;
}

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome to your Dashboard</h2>
        {email ? (
          <>
            <p>Logged in as {email}</p>
            <button onClick={() => auth.signOut()}>Logout</button>
          </>
        ) : (
          <button onClick={() => navigate("/login")}>Login</button>
        )}
      </div>
      <div className="section-break"></div>
      {deletionStatus && <p>{deletionStatus}</p>}
      {pumpkins.map(pumpkin => (
    <div className="dashboard-pumpkin" key={pumpkin.id}>
      <h3 onClick={() => navigate(`/pumpkin/${pumpkin.id}`)}>{pumpkin.name}</h3>
      <p>{pumpkin.description}</p>
      {pumpkin.latestMeasurement && <p>Latest Weight: {pumpkin.latestMeasurement.estimatedWeight} lbs</p>}
      {pumpkin.pollinated && <p>Days After Pollination: {daysSincePollination(pumpkin.pollinated)} days</p>}
      <div className="pumpkin-buttons">
        <button onClick={() => navigate(`/add-measurement/${pumpkin.id}`)}>Add Measurement</button>
        <button onClick={() => navigate(`/edit-pumpkin/${pumpkin.id}`)}>Edit Details</button>
        <button onClick={() => navigate(`/pumpkin/${pumpkin.id}`)}>Open Detailed View</button>
        <button className="delete-button" onClick={() => deletePumpkin(pumpkin.id)}>Delete</button>
      </div>
    </div>
  ))}
      <button className="add-pumpkin-button" onClick={() => navigate('/add-pumpkin')}>Add Pumpkin</button>
    </div>
  );
}

export default Dashboard;
