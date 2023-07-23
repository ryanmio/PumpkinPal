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
  return (
  <div className="h-screen my-8 flex justify-start flex-col">
    {growerData ? (
      <div className="container mx-auto px-4 pt-10 flex flex-col">
        <Header data={growerData} />
        <div className="mt-4">
          <SummarySection data={growerData} />
        </div>
        <div className="mt-4">
          <TableSection data={pumpkins} columns={pumpkinColumns} />
        </div>
        <div className="mt-4 bg-white shadow rounded-lg p-4 flex flex-col">
          <p><b>Grower ID:</b> {growerId}</p>
          <button onClick={handleEdit} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 self-end">Edit</button>
        </div>
      </div>
    ) : (
      <Spinner />
    )}
  </div>
);
};

export default MyStats;
