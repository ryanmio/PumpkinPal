import React, { useContext, useEffect, useState } from 'react';
import { firestore } from '../firebase'; // import Firestore
import { UserContext } from '../../contexts/UserContext';
import { GrowerContext } from '../../contexts/GrowerContext';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';
import fetchPumpkins from '../utilities/fetchPumpkins';
import fetchGrowerData from '../utilities/fetchGrowerData';

const MyStats = () => {
  const { user } = useContext(UserContext); // get the current user from the UserContext
  const { growerData, loading, error } = useContext(GrowerContext);
  const [growerId, setGrowerId] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      // fetch the grower ID from the user's profile in Firestore
      firestore.collection('Users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
          setGrowerId(doc.data().growerId);
        } else {
          console.log('No such document!');
        }
      }).catch(error => {
        console.log('Error getting document:', error);
      });
    }
  }, [user]);

    useEffect(() => {
      if (growerId) {
        // fetch the grower data based on the grower ID
        fetchGrowerData(growerId).then(data => {
          // do something with the data
        });
      }
    }, [growerId]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = (newGrowerId) => {
    // update the grower ID in Firestore
    firestore.collection('Users').doc(user.uid).update({
      growerId: newGrowerId
    }).then(() => {
      setGrowerId(newGrowerId);
      setEditing(false);
    }).catch(error => {
      console.error('Error updating document:', error);
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!growerData) {
    return <div>No data found for this grower</div>;
  }

  return (
    <div>
      <Header data={growerData} />
      <SummarySection data={growerData} />
      <TableSection data={growerData.pumpkins} />
      {editing ? (
        <div>
          <input type="text" defaultValue={growerId} onChange={e => setGrowerId(e.target.value)} />
          <button onClick={() => handleSave(growerId)}>Save</button>
        </div>
      ) : (
        <div>
          <p>Grower ID: {growerId}</p>
          <button onClick={handleEdit}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default MyStats;
