import { useContext } from 'react';
import { GrowerContext } from '.../contexts/GrowerContext';
import Header from './GrowerStatsProfile/Header';
import SummarySection from './GrowerStatsProfile/SummarySection';
import TableSection from './GrowerStatsProfile/TableSection';
import GraphSection from './GrowerStatsProfile/GraphSection';
import ShareSection from './GrowerStatsProfile/ShareSection';

const GrowerStatsProfile = () => {
  const { growerData } = useContext(GrowerContext);

  return (
    <div>
      <Header data={growerData} />
      <SummarySection data={growerData} />
      <TableSection data={growerData.pumpkins} />
      <GraphSection data={growerData.pumpkins} />
      <ShareSection data={growerData} />
    </div>
  );
};

export default GrowerStatsProfile;
