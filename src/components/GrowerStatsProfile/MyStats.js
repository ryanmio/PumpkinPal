import React, { useContext, useState } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { UserContext } from '../../contexts/UserContext';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';
import GrowerSearch from './GrowerSearch';
import Spinner from '../Spinner';
import useGrowerDataHook from '../../utilities/useGrowerDataHook';

console.log('db in MyStats.js:', db);

const MyStats = () => {
  const { user } = useContext(UserContext);
  const [growerId, setGrowerId] = useState(null);
  const [editingGrowerId, setEditingGrowerId] = useState(false);
  const { growerData, pumpkins, loading } = useGrowerDataHook(growerId);

  const handleEdit = () => {
    setEditingGrowerId(true);
  };

  const handleSave = (newGrowerId) => {
    updateDoc(doc(db, 'Users', user.uid), {
      growerId: newGrowerId
    }).then(() => {
      setGrowerId(newGrowerId);
      setEditingGrowerId(false);
    }).catch(error => {
      console.error('Error updating document:', error);
    });
  };

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

  if (loading) {
    return <Spinner />;
  }

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
