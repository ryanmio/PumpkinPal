import React, { useContext, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';
import GrowerSearch from './GrowerSearch';
import Spinner from '../Spinner';
import useGrowerData from '../../utilities/useGrowerDataHook';

const MyStats = () => {
  const { user, growerId, setGrowerId } = useContext(UserContext);
  const { growerData, pumpkins, loading } = useGrowerData(user ? user.uid : null);

  const handleEdit = () => {
    setGrowerId(null); // Clear the current growerId when starting to edit
  };

  if (loading) {
    return <Spinner />;
  }

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
