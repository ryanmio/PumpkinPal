import { useContext, useEffect } from 'react';
import { GrowerContext } from '../../contexts/GrowerContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import SummarySection from './SummarySection';
import TableSection from './TableSection';
import { UserContext } from '../../contexts/UserContext'; // Import UserContext

const GrowerStatsProfile = () => {
  const { setGrowerName, growerData, pumpkins, loading, error } = useContext(GrowerContext);
  const { growerName: growerNameFromUrl } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

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

  // Define columns for the table
  const pumpkinColumns = [
  {
    Header: 'Weight',
    accessor: 'weight',
    Cell: ({ value, row: { original } }) => (
      <Link to={`/pumpkin-details/${original.id}`} className="text-current no-underline hover:underline">
        {value} lbs
      </Link>
    ),
  },
  { Header: 'Year', accessor: 'year' },
  { Header: 'Contest', accessor: 'contestName' },
  {
    Header: 'Details',
    id: 'details', // we use 'id' because we are not using an accessor
    Cell: ({ row: { original } }) => ( // use the row's original data
      <Link to={`/pumpkin-details/${original.id}`} className="no-underline">
        <button className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Details
        </button>
      </Link>
    ),
  },
];



  return (
  <div className="min-h-screen flex justify-start flex-col container mx-auto px-4 pt-2 space-y-4">
    <div className="mt-3 flex">
        {user && ( // Conditionally render back button based on user
          <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-gray-900 transition duration-150 ease-in-out">← Back</button>
        )}
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
