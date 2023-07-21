import { useContext } from 'react';
import { GrowerContext } from '../../contexts/GrowerContext';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';

const GrowerStatsProfile = () => {
  const { growerData, loading } = useContext(GrowerContext);

  if (loading || !growerData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header data={growerData} />
      <SummarySection data={growerData} />
      <TableSection data={growerData.pumpkins} />
    </div>
  );
};

export default GrowerStatsProfile;
