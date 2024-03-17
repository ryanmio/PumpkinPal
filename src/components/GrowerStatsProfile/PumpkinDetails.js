import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import Spinner from '../Spinner';
import { UserContext } from '../../../contexts/UserContext';

const Field = ({ label, value, link }) => value && (
  <p><b>{label}:</b> {link ? <Link to={link} className="text-current no-underline hover:underline">{value}</Link> : value}</p>
);

const PumpkinDetailsCard = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <h1>{data.id} {data.name}</h1>
    <Field label="Grower" value={data.grower} link={`/grower/${encodeURIComponent(data.grower)}`} />
    <Field label="OTT" value={data.ott} />
    <Field label="Weight" value={data.weight} />
    <Field label="Seed" value={data.seed} />
    <Field label="Pollinator" value={data.pollinator} />
    <Field label="Year" value={data.year} />
    <Field label="State" value={data.state} />
    <Field label="Site" value={data.contestName} link={`/site-profile/${encodeURIComponent(data.contestName)}`} />
  </div>
);

const PumpkinRankingsCard = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4 flex justify-center">
    <div className="max-w-lg w-full mb-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="col-span-3 text-lg font-bold mb-2">Ranking Matrix</div>
        <div></div>
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

const PumpkinDetails = () => {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'Stats_Pumpkins', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setState({ loading: false, data: docSnap.data(), error: null });
        } else {
          setState({ loading: false, data: null, error: "No such pumpkin!" });
        }
      } catch (error) {
        setState({ loading: false, data: null, error: error.message });
      }
    };
    fetchData();
  }, [id]);

  if (state.loading) return <Spinner />;
  if (state.error) return <div>Error: {state.error}</div>;

  return (
    <div className="min-h-screen flex justify-start flex-col">
      <div className="container mx-auto px-4 pt-10 flex flex-col space-y-4">
        <div className="text-left">
          {user && (
            <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-gray-900 transition duration-150 ease-in-out">← Back</button>
          )}
        </div>
        <PumpkinDetailsCard data={state.data} />
        <PumpkinRankingsCard data={state.data} />
      </div>
    </div>
  );
};

export default PumpkinDetails;
