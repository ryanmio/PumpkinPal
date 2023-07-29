import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import Spinner from '../Spinner';

// Component for displaying contest details
const ContestDetailsCard = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <h1>{data.name}</h1> {/* changed from data.id to data.name */}
    <p><b>Year:</b> {data.year}</p>
    <p><b>Record Weight:</b> {data.recordWeight}</p>
    <p><b>Year Popularity:</b> {data.YearPopularity}</p>
    <p><b>Lifetime Popularity:</b> {data.LifetimePopularity}</p>
  </div>
);

const SiteProfile = () => {
  const { id } = useParams();
  const siteName = id.replace(/_/g, ' ');
  const [contestData, setContestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const contestsQuery = query(collection(db, 'Stats_Contests'), where('name', '==', siteName));
        const querySnapshot = await getDocs(contestsQuery);
        if (!querySnapshot.empty) {
          let data = {};
          querySnapshot.forEach((doc) => {
            data = {...data, ...doc.data()};
          });
          setContestData(data);
        } else {
          setError(`No contests found for site: ${siteName}`);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, siteName]);

  // Loading state
  if (loading) {
    return <Spinner />;
  }

  // Error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render fetched data
  return (
    <div className="min-h-screen flex justify-start flex-col">
      <div className="container mx-auto px-4 pt-10 flex flex-col space-y-4">
        <div className="text-left">
          <Link to="#" onClick={() => navigate(-1)} className="text-gray-700 hover:text-gray-900 transition duration-150 ease-in-out">Back</Link>
        </div>
        <ContestDetailsCard data={contestData} />
      </div>
    </div>
  );
};

export default SiteProfile;
