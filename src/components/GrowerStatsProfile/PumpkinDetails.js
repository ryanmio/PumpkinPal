// Import necessary modules and components
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Spinner from '../Spinner';
import { UserContext } from '../../contexts/UserContext';

// Component for displaying pumpkin details
// Conditionally renders fields based on their values
const PumpkinDetailsCard = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <h1>{data.id} {data.name}</h1>
    {data.grower && <p><b>Grower:</b> {data.grower}</p>}
    {(data.ott !== null && data.ott !== 0) && <p><b>OTT:</b> {data.ott}</p>}
    <p><b>Weight:</b> {data.weight}</p>
    {(typeof data.seed !== 'undefined' && !isNaN(data.seed)) && <p><b>Seed:</b> {data.seed}</p>}
    {(typeof data.pollinator !== 'undefined' && !isNaN(data.pollinator)) && <p><b>Pollinator:</b> {data.pollinator}</p>}
    <p><b>Year:</b> {data.year}</p>
    {data.state && <p><b>State:</b> {data.state}</p>}
    {data.contestName && <p><b>Site:</b> <Link to={`/site-profile/${data.contestName.replace(/ /g, '_')}`}>{data.contestName}</Link></p>}
  </div>
);

// Component for displaying pumpkin rankings
const PumpkinRankingsCard = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4 flex justify-center">
    <div className="max-w-lg w-full mb-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="col-span-3 text-lg font-bold mb-2">Ranking Matrix</div> {/* Heading */}
        <div></div> {/* Empty cell */}
        <div><b>{data.year}</b></div>
        <div><b>All Time</b></div>
        <div><b>Global</b></div>
        <div>#{data.yearGlobalRank}</div> 
        <div>#{data.lifetimeGlobalRank}</div>
        <div><b>{data.country}</b></div>
        <div>#{data.yearlyCountryRank}</div> 
        <div>#{data.lifetimeCountryRank}</div>
        <div><b>{data.state}</b></div>
        <div>#{data.yearlyStateRank}</div>
        <div>#{data.lifetimeStateRank}</div>
      </div>
    </div>
  </div>
);

// Component for fetching and displaying pumpkin details and rankings
const PumpkinDetails = () => {
  const { id } = useParams();
  const [pumpkinData, setPumpkinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'Stats_Pumpkins', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPumpkinData(docSnap.data());
        } else {
          setError("No such pumpkin!");
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
          {user && ( // Conditionally render back button based on user
            <Link to="#" onClick={() => navigate(-1)} className="text-gray-700 hover:text-gray-900 transition duration-150 ease-in-out">Back</Link>
          )}
        </div>
        <PumpkinDetailsCard data={pumpkinData} />
        <PumpkinRankingsCard data={pumpkinData} />
      </div>
    </div>
  );
};

export default PumpkinDetails;
