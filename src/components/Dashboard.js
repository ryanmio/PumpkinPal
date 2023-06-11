import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
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
        setPumpkins(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
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

return (
  <div className="dashboard-container">
    <h2>Welcome to your Dashboard</h2> <br />
    <p>{email ? `Logged in as ${email}` : 'Not logged in'}</p> <br />
    {deletionStatus && <p>{deletionStatus}</p>}
    {pumpkins.map(pumpkin => (
      <div className="dashboard-pumpkin" key={pumpkin.id}>
        <h3 onClick={() => navigate(`/pumpkin/${pumpkin.id}`)}>{pumpkin.name}</h3>
        <p>{pumpkin.description}</p>
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
