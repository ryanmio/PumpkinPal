import { useContext, useEffect } from 'react';
import { GrowerContext } from '../../contexts/GrowerContext';
import { useParams } from 'react-router-dom';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';

const GrowerStatsProfile = () => {
  const { setGrowerName, growerData, loading, error } = useContext(GrowerContext);
  const { growerName: growerNameFromUrl } = useParams(); // get growerName from the URL
  console.log('Grower Name from URL:', growerNameFromUrl); // Logging grower name from URL

  useEffect(() => {
    console.log('Setting grower name:', growerNameFromUrl); // Logging grower name being set
    setGrowerName(growerNameFromUrl); // directly set growerName from the URL
  }, [growerNameFromUrl, setGrowerName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;  // Display error message when error exists
  }

  if (!growerData) {
    return <div>No data found for this grower</div>;  // Display a message when no data is found for the grower
  }

  return (
  <div>
    <Header data={growerData} />
    <SummarySection data={growerData} />
    {/* <TableSection data={growerData.pumpkins} /> */}
  </div>
);

export default GrowerStatsProfile;
