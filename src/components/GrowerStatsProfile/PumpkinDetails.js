import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Spinner from '../Spinner';

const PumpkinDetailsCard = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <h1>{data.id} {data.name}</h1>
    {data.grower !== null && data.grower !== undefined && data.grower !== 0 && <p><b>Grower:</b> {data.grower}</p>}
    {data.ott !== null && data.ott !== undefined && data.ott !== 0 && <p><b>OTT:</b> {data.ott}</p>}
    {data.weight !== null && data.weight !== undefined && data.weight !== 0 && <p><b>Weight:</b> {data.weight}</p>}
    {data.seed !== null && data.seed !== undefined && data.seed !== 0 && <p><b>Seed:</b> {data.seed}</p>}
    {data.pollinator !== null && data.pollinator !== undefined && data.pollinator !== 0 && <p><b>Pollinator:</b> {data.pollinator}</p>}
    {data.year !== null && data.year !== undefined && data.year !== 0 && <p><b>Year:</b> {data.year}</p>}
    {data.state !== null && data.state !== undefined && data.state !== 0 && <p><b>State:</b> {data.state}</p>}
    {data.contestName !== null && data.contestName !== undefined && data.contestName !== 0 && <p><b>Contest Name:</b> {data.contestName}</p>}
  </div>
);

const PumpkinDetailsCard = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <h1>{data.id} {data.name}</h1>
    {data.grower && !isNaN(data.grower) && <p><b>Grower:</b> {data.grower}</p>}
    {data.ott && !isNaN(data.ott) && <p><b>OTT:</b> {data.ott}</p>}
    {data.weight && !isNaN(data.weight) && <p><b>Weight:</b> {data.weight}</p>}
    {data.seed && !isNaN(data.seed) && <p><b>Seed:</b> {data.seed}</p>}
    {data.pollinator && !isNaN(data.pollinator) && <p><b>Pollinator:</b> {data.pollinator}</p>}
    {data.year && !isNaN(data.year) && <p><b>Year:</b> {data.year}</p>}
    {data.state && !isNaN(data.state) && <p><b>State:</b> {data.state}</p>}
    {data.contestName && !isNaN(data.contestName) && <p><b>Contest Name:</b> {data.contestName}</p>}
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
