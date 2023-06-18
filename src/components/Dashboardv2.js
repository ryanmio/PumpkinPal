import React, { useState, useEffect } from 'react';
import { auth, db, query, orderBy, limit } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDocs, deleteDoc } from 'firebase/firestore';
import Dropdown from './Dropdown';
import Spinner from './Spinner';

function Dashboard() {
  const [email, setEmail] = useState('');
  const [pumpkins, setPumpkins] = useState([]);
  const [deletionStatus, setDeletionStatus] = useState('');
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
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
  <div className="container mx-auto px-4">
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-2">Welcome to your Dashboard</h2>
      {email ? (
        <>
          <p className="mb-4">Logged in as {email}</p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => auth.signOut()}>Logout</button>
        </>
      ) : (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => navigate("/login")}>Login</button>
      )}
    </div>
    <div className="my-8">
      {deletionStatus && <p className="mb-4">{deletionStatus}</p>}
      {loading ? (
        <Spinner />
      ) : (
        pumpkins.map(pumpkin => (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4" key={pumpkin.id}>
            <div className="px-4 py-5 sm:px-6 flex justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900" onClick={() => navigate(`/pumpkin/${pumpkin.id}`)}>{pumpkin.name}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">{pumpkin.description}</p>
                {pumpkin.latestMeasurement && <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest Weight: {pumpkin.latestMeasurement.estimatedWeight} lbs</p>}
                {pumpkin.pollinated && <p className="mt-1 max-w-2xl text-sm text-gray-500">Days After Pollination: {daysSincePollination(pumpkin.pollinated)} days</p>}
              </div>
              <Dropdown 
                onAddMeasurement={() => navigate(`/add-measurement/${pumpkin.id}`)} 
                onEdit={() => navigate(`/edit-pumpkin/${pumpkin.id}`)} 
                onDetailedView={() => navigate(`/pumpkin/${pumpkin.id}`)} 
                onDelete={() => deletePumpkin(pumpkin.id)} 
              />
            </div>
          </div>
        ))
      )}
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" onClick={() => navigate('/add-pumpkin')}>Add Pumpkin</button>
    </div>
  </div>
);
}

export default Dashboard;
