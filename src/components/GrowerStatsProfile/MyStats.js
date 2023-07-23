import React, { useContext, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserContext } from '../../contexts/UserContext';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';
import GrowerSearch from './GrowerSearch';
import Spinner from '../Spinner';
import useGrowerData from '../../utilities/useGrowerDataHook';

const MyStats = () => {
  const { user, growerId, setGrowerId } = useContext(UserContext);
    console.log('Rendering MyStats with user:', user);
  const [editingGrowerId, setEditingGrowerId] = useState(false);
  const { growerData, pumpkins, loading } = useGrowerData(user?.uid);

  const handleEdit = () => {
    setEditingGrowerId(true);
  };

  const handleSave = (newGrowerId) => {
  updateDoc(doc(db, 'Users', user.uid), {
    growerId: newGrowerId
  }).catch(error => {
    console.error('Error updating document:', error);
  });
};


  if (loading) {
    return <Spinner />;
  }

  if (editingGrowerId || !growerId) {
    return <GrowerSearch user={user} onGrowerIdChange={handleSave} />;
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
