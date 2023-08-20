import { useContext, useEffect } from 'react';
import { GrowerContext } from '../../contexts/GrowerContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';

const GrowerStatsProfile = () => {
  const { setGrowerName, growerData, pumpkins, loading, error } = useContext(GrowerContext);
  const { growerName: growerNameFromUrl } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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

  const goBack = () => {
    if (location.state && location.state.from) {
      navigate(location.state.from);
    } else {
      // fallback navigation if no previous location state is available
      navigate('/search');
    }
  };

  // Define columns for the table
  const pumpkinColumns = [
    { Header: 'Year', accessor: 'year' },
    { Header: 'Contest', accessor: 'contestName' },
    { Header: 'Weight', accessor: 'weight' },
  ];

  return (
    <div className="min-h-screen flex justify-start flex-col container mx-auto px-4 pt-10 space-y-4">
      <div className="mb-4">
        <button onClick={goBack} className="text-blue-600 hover:underline">← Back to Search Results</button>
      </div>
      <Header data={growerData} />
      <SummarySection data={growerData} />
      {pumpkins && pumpkins.length > 0 && (
        <TableSection data={pumpkins} columns={pumpkinColumns} />
      )}
    </div>
  );
};

export default GrowerStatsProfile;
