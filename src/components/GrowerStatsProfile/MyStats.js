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
  const { growerData, pumpkins, loading } = useGrowerData(user?.uid, growerId);

  const handleEdit = () => {
    setEditingGrowerId(true);
  };

  const handleSave = (newGrowerId) => {
  console.log('handleSave called with newGrowerId:', newGrowerId);
  updateDoc(doc(db, 'Users', user.uid), {
    growerId: newGrowerId
  }).then(() => {
    console.log('updateDoc success, calling setGrowerId...');
    setGrowerId(newGrowerId); // Update growerId in context
    setEditingGrowerId(false); // Exit editing mode
    toast.success('Grower ID confirmed!'); // Add this line to show a success toast
  }).catch(error => {
    console.error('Error updating document:', error);
    toast.error('Error confirming Grower ID.'); // Add this line to show an error toast
  });
};

  if (loading) {
    return <Spinner />;
  }

  if (editingGrowerId || !growerId) {
    return <GrowerSearch user={user} handleSave={handleSave} />;
  }

  const pumpkinColumns = [
    { Header: 'Year', accessor: 'year' },
    { Header: 'Contest', accessor: 'contestName' },
    { Header: 'Place', accessor: 'place' },
    { Header: 'Weight', accessor: 'weight' },
  ];

  return (
    <div>
      {growerData && (
        <>
          <Header data={growerData} />
          <SummarySection data={growerData} pumpkins={pumpkins} />
          <TableSection data={pumpkins} columns={pumpkinColumns} />
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
