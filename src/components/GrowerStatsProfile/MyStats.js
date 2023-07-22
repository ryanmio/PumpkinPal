import React, { useContext, useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserContext } from '../../contexts/UserContext';
import { GrowerContext } from '../../contexts/GrowerContext';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';
import fetchPumpkins from '../../utilities/fetchPumpkins';
import fetchGrowerData from '../../utilities/fetchGrowerData';

console.log('db in MyStats.js:', db);

const MyStats = () => {
  const { user } = useContext(UserContext); // get the current user from the UserContext
  const { growerData, loading, error } = useContext(GrowerContext);
  const [growerId, setGrowerId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [pumpkins, setPumpkins] = useState([]); // add a state variable for the pumpkins

  useEffect(() => {
    if (user) {
      // fetch the grower ID from the user's profile in Firestore
      getDoc(doc(db, 'Users', user.uid)).then(docSnapshot => {
        if (docSnapshot.exists()) {
          setGrowerId(docSnapshot.data().growerId);
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

      // fetch the pumpkins associated with the grower ID
      fetchPumpkins(growerId).then(pumpkins => {
        setPumpkins(pumpkins);
      });
    }
  }, [growerId]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = (newGrowerId) => {
    // update the grower ID in Firestore
   updateDoc(doc(db, 'Users', user.uid), {
      growerId: newGrowerId
    }).then(() => {
      setGrowerId(newGrowerId);
      setEditing(false);

      // fetch the pumpkins associated with the new grower ID
      fetchPumpkins(newGrowerId).then(pumpkins => {
        setPumpkins(pumpkins);
      });
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
      <TableSection data={pumpkins} /> {/* use the pumpkins state variable here */}
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
