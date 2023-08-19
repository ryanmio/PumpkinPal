import { useContext, useEffect } from 'react';
import { GrowerContext } from '../../contexts/GrowerContext';
import { useParams } from 'react-router-dom';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';

const GrowerStatsProfile = () => {
  const { growerName, setGrowerName, growerData, loading, error } = useContext(GrowerContext);
  const { growerName: growerNameFromUrl } = useParams(); // get growerName from the URL

  useEffect(() => {
    if (growerName !== growerNameFromUrl) {
      setGrowerName(growerNameFromUrl); // update growerName in the context if it's different from the one in the URL
    }
  }, [growerName, growerNameFromUrl, setGrowerName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;  // Display error message when error exists
  }

  if (!growerData || !Array.isArray(growerData.pumpkins)) {
    return <div>No pumpkins data found for this grower</div>;  // Add an additional check for pumpkins data
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
