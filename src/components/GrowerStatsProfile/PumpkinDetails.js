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
  <div className="bg-white shadow rounded-lg p-4 mb-4 grid grid-cols-3 gap-4 text-center">
    <div></div> {/* Empty cell */}
    <div><b>Global</b></div>
    <div><b>Country</b></div>
    <div><b>State</b></div>
    <div>{data.year}</div> {/* Column for Year data */}
    <div>{data.yearGlobalRank}</div>
    <div>{data.yearlyCountryRank}</div>
    <div>{data.yearlyStateRank}</div>
    <div>All Time</div> {/* Column for All Time data */}
    <div>{data.lifetimeGlobalRank}</div>
    <div>{data.lifetimeCountryRank}</div>
    <div>{data.lifetimeStateRank}</div>
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
        <div className="text-left"> {/* Enclosed the "Back" link in its own div */}
          <Link to="#" onClick={() => navigate(-1)} className="text-gray-700 hover:text-gray-900 transition duration-150 ease-in-out">Back</Link>
        </div>
        <PumpkinDetailsCard data={pumpkinData} />
        <PumpkinRankingsCard data={pumpkinData} />
      </div>
    </div>
  );
};

export default PumpkinDetails;
