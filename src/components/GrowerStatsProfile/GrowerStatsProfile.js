import { useContext, useEffect } from 'react';
import { GrowerContext } from '../../contexts/GrowerContext';
import { useParams } from 'react-router-dom';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';

const GrowerStatsProfile = () => {
  const { growerName, setGrowerName, growerData, loading } = useContext(GrowerContext);
  const { growerName: growerNameFromUrl } = useParams(); // get growerName from the URL

  useEffect(() => {
    if (growerName !== growerNameFromUrl) {
      setGrowerName(growerNameFromUrl); // update growerName in the context if it's different from the one in the URL
    }
  }, [growerName, growerNameFromUrl, setGrowerName]);

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
