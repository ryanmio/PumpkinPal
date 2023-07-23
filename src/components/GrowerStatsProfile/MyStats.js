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
import { toast } from 'react-hot-toast';

const MyStats = () => {
  const { user, growerId, setGrowerId } = useContext(UserContext);
  const [editingGrowerId, setEditingGrowerId] = useState(false);
  const { growerData, pumpkins, loading } = useGrowerData(user?.uid, growerId);

  const handleEdit = () => {
    setEditingGrowerId(true);
  };

  const handleSave = (newGrowerId) => {
    updateDoc(doc(db, 'Users', user.uid), {
      growerId: newGrowerId
    }).then(() => {
      setGrowerId(newGrowerId); // Update growerId in context
      setEditingGrowerId(false); // Exit editing mode
      toast.success('Grower ID confirmed!'); // Add this line to show a success toast
    }).catch(error => {
      console.error('Error updating document:', error); // Keep this log to record potential errors
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
          <SummarySection data={growerData} />
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
