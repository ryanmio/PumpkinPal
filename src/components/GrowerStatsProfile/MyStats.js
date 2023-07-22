import React, { useContext, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';
import GrowerSearch from './GrowerSearch';
import Spinner from '../Spinner';
import useGrowerData from '../../utilities/useGrowerDataHook';

const MyStats = () => {
  const { user } = useContext(UserContext);
  const [growerId, setGrowerIdInState] = useState(null);
  const { growerData, pumpkins, loading } = useGrowerData(user ? user.uid : null);

  const handleEdit = () => {
    setGrowerIdInState(null);
  };

  const handleSave = (newGrowerId) => {
    updateDoc(doc(db, 'Users', user.uid), {
      growerId: newGrowerId
    }).then(() => {
      setGrowerIdInState(newGrowerId);
    }).catch(error => {
      console.error('Error updating document:', error);
    });
  };

  if (loading) {
    return <Spinner />;
  }

  if (!growerId) {
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
