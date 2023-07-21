import { useContext, useEffect, useState } from 'react';
import { GrowerContext } from '../../contexts/GrowerContext';
import { useAuth } from '../../contexts/AuthContext'; // import your AuthContext
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';

const MyStats = () => {
  const { currentUser } = useAuth(); // get the current user from the AuthContext
  const { growerData, loading, error } = useContext(GrowerContext);
  const [growerId, setGrowerId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      // fetch the grower ID from the user's profile and set it to the state
      // replace 'getGrowerId' with the actual function to fetch the grower ID
      getGrowerId(currentUser.uid).then(setGrowerId);
    }
  }, [currentUser]);

  useEffect(() => {
    if (growerId) {
      // fetch the grower data based on the grower ID
      // replace 'fetchGrowerData' with the actual function to fetch the grower data
      fetchGrowerData(growerId);
    }
  }, [growerId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!growerData) {
    return <div>No data found for this grower</div>;
  }

  return (
    <div>
      <Header data={growerData} />
      <SummarySection data={growerData} />
      <TableSection data={growerData.pumpkins} />
    </div>
  );
};

export default MyStats;
