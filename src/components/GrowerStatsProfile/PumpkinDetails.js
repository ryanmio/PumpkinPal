import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Spinner from '../Spinner';

const PumpkinDetailsCard = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <h1>{data.id} {data.name}</h1>
    <p><b>Grower:</b> {data.grower}</p>
    <p><b>OTT:</b> {data.ott}</p>
    <p><b>Weight:</b> {data.weight}</p>
    <p><b>Seed:</b> {data.seed}</p>
    <p><b>Pollinator:</b> {data.pollinator}</p>
    <p><b>Year:</b> {data.year}</p>
    <p><b>State:</b> {data.state}</p>
    <p><b>Contest Name:</b> {data.contestName}</p>
  </div>
);

const PumpkinRankingsCard = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <p><b>Lifetime Global Rank:</b> {data.lifetimeGlobalRank}</p>
    <p><b>Lifetime Country Rank:</b> {data.lifetimeCountryRank}</p>
    <p><b>Lifetime State Rank:</b> {data.lifetimeStateRank}</p>
    <p><b>Year Global Rank:</b> {data.yearGlobalRank}</p>
    <p><b>Yearly Country Rank:</b> {data.yearlyCountryRank}</p>
    <p><b>Yearly State Rank:</b> {data.yearlyStateRank}</p>
  </div>
);

const PumpkinDetails = () => {
  const { id } = useParams();
  const [pumpkinData, setPumpkinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
  }, [id]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex justify-start flex-col">
      <div className="container mx-auto px-4 pt-10 flex flex-col space-y-4">
        <Link to="#" onClick={() => navigate(-1)} className="text-gray-700 hover:text-gray-900 transition duration-150 ease-in-out">Back</Link>
        <PumpkinDetailsCard data={pumpkinData} />
        <PumpkinRankingsCard data={pumpkinData} />
      </div>
    </div>
  );
};

export default PumpkinDetails;
