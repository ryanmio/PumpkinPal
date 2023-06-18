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
      {pumpkins.map(pumpkin => (
        <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-4" key={pumpkin.id}>
          <div className="flex justify-end px-4 pt-4">
            <button className="text-gray-500 hover:bg-gray-100 focus:outline-none p-1.5">
              <span className="sr-only">Open dropdown</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path></svg>
            </button>
          </div>
          <div className="p-6">
            <h5 className="mb-2 text-xl font-medium leading-tight text-gray-800">{pumpkin.name}</h5>
            <p className="mb-4 text-base text-gray-600">{pumpkin.description}</p>
            <p className="mb-4 text-sm text-gray-600">Maternal Lineage: {pumpkin.maternalLineage}</p>
            <p className="mb-4 text-sm text-gray-600">Paternal Lineage: {pumpkin.paternalLineage}</p>
            {pumpkin.latestMeasurement && <p className="mb-4 text-lg text-gray-800">Latest Weight: {pumpkin.latestMeasurement.estimatedWeight} lbs</p>}
            {pumpkin.pollinated && <p className="mb-4 text-sm text-gray-600">Pollinated Date: {pumpkin.pollinated}</p>}
            {pumpkin.pollinated && <p className="mb-4 text-sm text-gray-600">Days Since Pollination: {daysSincePollination(pumpkin.pollinated)} days</p>}
            <div className="mt-4">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2" onClick={() => navigate(`/add-measurement/${pumpkin.id}`)}>Add Measurement</button>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2" onClick={() => navigate(`/pumpkin/${pumpkin.id}`)}>Open Detailed View</button>
            </div>
          </div>
          <button className="text-red-500 hover:bg-red-100 focus:outline-none p-1.5" onClick={() => deletePumpkin(pumpkin.id)}>
            <span className="sr-only">Delete pumpkin</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16 6a2 2 0 00-2-2H6a2 2 0 00-2 2h12zm-1 2H5a1 1 0 00-.117 1.993L5 10h10a1 1 0 00.117-1.993L15 8z" clipRule="evenodd"></path>
              <path fillRule="evenodd" d="M5 9a1 1 0 00-.993.883L4 10v6a2 2 0 001.85 1.995L6 18h8a2 2 0 001.995-1.85L16 16v-6a1 1 0 00-.883-.993L15 9H5zm3 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm4 0a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      ))}
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" onClick={() => navigate('/add-pumpkin')}>Add Pumpkin</button>
    </div>
  </div>
);
}

export default Dashboard;
1