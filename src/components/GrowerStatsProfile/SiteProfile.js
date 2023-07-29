import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Spinner from '../Spinner';

// Component for displaying contest details
const ContestDetailsCard = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <h1>{data.id} {data.name}</h1>
    <p><b>Year:</b> {data.year}</p>
    <p><b>Record Weight:</b> {data.recordWeight}</p>
    <p><b>Year Popularity:</b> {data.YearPopularity}</p>
    <p><b>Lifetime Popularity:</b> {data.LifetimePopularity}</p>
  </div>
);

const SiteProfile = () => {
  const { id } = useParams();
  const [contestData, setContestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'Stats_Contests', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContestData(docSnap.data());
        } else {
          setError("No such contest!");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // Depend on 'id' so the effect runs whenever it changes

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
