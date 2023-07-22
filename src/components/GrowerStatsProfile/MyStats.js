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
  const [editingGrowerId, setEditingGrowerId] = useState(false);
  const [pumpkins, setPumpkins] = useState([]);
  const [growerData, setGrowerData] = useState(null); 

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
        setGrowerData(data);
      });

      fetchPumpkins(growerId).then(pumpkins => {
        setPumpkins(pumpkins);
      });
    }
  }, [growerId]);

  const handleEdit = () => {
    setEditingGrowerId(true);
  };

  const handleSave = (newGrowerId) => {
    updateDoc(doc(db, 'Users', user.uid), {
      growerId: newGrowerId
    }).then(() => {
      setGrowerId(newGrowerId);
      setEditingGrowerId(false);

      fetchPumpkins(newGrowerId).then(pumpkins => {
        setPumpkins(pumpkins);
      });
    }).catch(error => {
      console.error('Error updating document:', error);
    });
  };

  if (editingGrowerId || !growerId) {
    return <GrowerSearch user={user} setGrowerId={handleSave} />;
  }

  return (
    <div>
      {growerData && (
        <>
          <Header data={growerData} />
          <SummarySection data={growerData} pumpkins={pumpkins} />
          <TableSection data={pumpkins} />
          <div>
            <p>Grower ID: {growerId}</p>
            <button onClick={handleEdit}>Edit</button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyStats;
