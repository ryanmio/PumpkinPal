import { useContext, useEffect } from 'react';
import { GrowerContext } from '../../contexts/GrowerContext';
import { useParams } from 'react-router-dom';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';

const GrowerStatsProfile = () => {
  const { setGrowerName, growerData, pumpkins, loading, error } = useContext(GrowerContext);
  const { growerName: growerNameFromUrl } = useParams();
  console.log('Grower Name from URL:', growerNameFromUrl);

  useEffect(() => {
    console.log('Setting grower name:', growerNameFromUrl);
    setGrowerName(growerNameFromUrl);
  }, [growerNameFromUrl, setGrowerName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!growerData) {
    return <div>No data found for this grower</div>;
  }

  // Define columns for the table
  const pumpkinColumns = [
    { Header: 'Year', accessor: 'year' },
    { Header: 'Contest', accessor: 'contestName' },
    { Header: 'Weight', accessor: 'weight' },
  ];
console.log('growerData.pumpkins:', growerData.pumpkins);

  return (
  <div className="min-h-screen flex justify-start flex-col container mx-auto px-4 pt-10 flex flex-col space-y-4">
    <div className="bg-white shadow rounded-lg p-4 mb-4 flex flex-col">
      <Header data={growerData} />
      <SummarySection data={growerData} />
      {pumpkins && pumpkins.length > 0 && (
        <TableSection data={pumpkins} columns={pumpkinColumns} />
      )}
    </div>
  </div>
);
};

export default GrowerStatsProfile;
