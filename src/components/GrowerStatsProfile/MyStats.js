import React, { useContext, useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserContext } from '../../contexts/UserContext';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';
import fetchPumpkins from '../../utilities/fetchPumpkins';
import fetchGrowerData from '../../utilities/fetchGrowerData';
import GrowerSearch from './GrowerSearch';

console.log('db in MyStats.js:', db);

const MyStats = () => {
  const { user } = useContext(UserContext);
  const [growerId, setGrowerId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [pumpkins, setPumpkins] = useState([]);
  const [growerData, setGrowerData] = useState(null); // add a state variable for the grower data

  useEffect(() => {
    if (user) {
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
      fetchGrowerData(growerId).then(data => {
        setGrowerData(data); // save the data in the state variable
      });

      fetchPumpkins(growerId).then(pumpkins => {
        setPumpkins(pumpkins);
      });
    }
  }, [growerId]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = (newGrowerId) => {
    updateDoc(doc(db, 'Users', user.uid), {
      growerId: newGrowerId
    }).then(() => {
      setGrowerId(newGrowerId);
      setEditing(false);

      fetchPumpkins(newGrowerId).then(pumpkins => {
        setPumpkins(pumpkins);
      });
    }).catch(error => {
      console.error('Error updating document:', error);
    });
  };

  if (!growerId) {
    return <GrowerSearch user={user} setGrowerId={setGrowerId} />;
  }

  return (
    <div>
      {growerData && (
        <>
          <Header data={growerData} />
          <SummarySection data={growerData} pumpkins={pumpkins} />
          <TableSection data={pumpkins} />
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
        </>
      )}
    </div>
  );
};

export default MyStats;
