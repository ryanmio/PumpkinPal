import { useContext } from 'react';
import { GrowerContext } from '.../contexts/GrowerContext';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';
import GraphSection from './GraphSection';
import ShareSection from './hareSection';

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
