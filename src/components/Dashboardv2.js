import React, { useState, useEffect } from 'react';
import { auth, db, query, orderBy, limit } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDocs, deleteDoc } from 'firebase/firestore';
import Dropdown from './Dropdown';

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
  {deletionStatus && <p className="mb-4">{deletionStatus}</p>}
  {loading ? (
    <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed" disabled>
      <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12c0 1.33.26 2.61.74 3.77.1.24.26.47.42.69l1.42-1.42c-.16-.37-.28-.76-.28-1.18 0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6c-1.3 0-2.48-.41-3.47-1.11l-1.42 1.42C8.6 20.6 10.2 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-3.87 0-7-3.13-7-7 0-.62.08-1.21.21-1.79l2.98 2.98c.36.36 .86.59 1.41.59 1.1 0 2-.9 2-2 0-.55-.23-1.04-.59-1.41L4.2 8.21C4.78 7.08 5.86 6 7 6c3.87 0 7 3.13 7 7s-3.13 7-7 7z"/>
      </svg>
      Loading...
    </button>
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
          <Dropdown onEdit={() => navigate(`/edit-pumpkin/${pumpkin.id}`)} onDelete={() => deletePumpkin(pumpkin.id)} />
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
