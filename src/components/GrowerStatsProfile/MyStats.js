import React, { useContext, useState } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { UserContext } from '../../contexts/UserContext';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';
import GrowerSearch from './GrowerSearch';
import Spinner from '../Spinner';
import useGrowerData from '../../utilities/useGrowerDataHook';

const MyStats = () => {
  const { user } = useContext(UserContext);
  const [editingGrowerId, setEditingGrowerId] = useState(false);
  const { growerId, growerData, pumpkins, loading } = useGrowerData(user.uid); // Pass user.uid instead of growerId

  const handleEdit = () => {
    setEditingGrowerId(true);
  };

  const handleSave = (newGrowerId) => {
    updateDoc(doc(db, 'Users', user.uid), {
      growerId: newGrowerId
    }).then(() => {
      setEditingGrowerId(false);
    }).catch(error => {
      console.error('Error updating document:', error);
    });
  };

  if (loading) {
    return <Spinner />;
  }

  if (editingGrowerId || !growerId) {
  return <GrowerSearch user={user} setGrowerId={handleSave} growerId={growerId} />;
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
