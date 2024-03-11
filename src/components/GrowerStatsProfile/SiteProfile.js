import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import Spinner from '../Spinner';
import { Line } from 'react-chartjs-2';
import { UserContext } from '../../../contexts/UserContext';

// Component for displaying site details
const SiteDetailsCard = ({ data, popularityData, weightData }) => {

  return (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <h1 className="mb-3">{data.id}</h1>
    <div className="flex justify-between sm:flex-wrap">
      <div className="text-center sm:text-center mb-2 sm:mb-4 flex-1 mx-auto">
        <h2 className="text-sm sm:text-lg mb-1">Site Record (lbs)</h2>
        <p className="text-xl sm:text-2xl font-light">{data['Site Record']}</p>
      </div>
      <div className="text-center sm:text-center mb-2 sm:mb-4 flex-1 mx-auto">
        <h2 className="text-sm sm:text-lg mb-1">Total Entries</h2>
        <p className="text-xl sm:text-2xl font-light">{data['Total Entries']}</p>
      </div>
    </div>
    <Line data={popularityData} />
    <Line data={weightData} />
    <table className="mt-4 w-full table-auto">
      <thead>
        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
          <th className="py-3 px-6 text-center">Year</th>
          <th className="py-3 px-6 text-center">Entries</th>
          <th className="py-3 px-6 text-center">1st Place (lbs)</th>
        </tr>
      </thead>
      <tbody className="text-gray-600 text-sm font-light">
        {popularityData.labels.map((year, i) => (
          <tr className="border-b border-gray-200 hover:bg-gray-100" key={year}>
            <td className="py-3 px-6 text-center">{year}</td>
            <td className="py-3 px-6 text-center">{popularityData.datasets[0].data[i]}</td>
            <td className="py-3 px-6 text-center">{weightData.datasets[0].data[i]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
};

const SiteProfile = () => {
  const { id } = useParams();
  const siteName = id.replace(/_/g, ' ');
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const docRef = doc(db, 'Stats_Sites', siteName);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const popularityData = {
              labels: Object.keys(data['Popularity by Year']),
              datasets: [{
                label: 'Entries by Year',
                data: Object.values(data['Popularity by Year']),
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.2)',
                pointRadius: 5, // Make points a bit larger
                pointHoverRadius: 7, // Make points larger when hovering over them
                pointLabel: Object.values(data['Popularity by Year']).toString(), // Add point labels
              }],
            };
          const weightData = {
              labels: Object.keys(data['Max Weight by Year']),
              datasets: [{
                label: 'Max Weight by Year',
                data: Object.values(data['Max Weight by Year']),
                fill: false,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgba(255, 99, 132, 0.2)',
                pointRadius: 5, // Make points a bit larger
                pointHoverRadius: 7, // Make points larger when hovering over them
                pointLabel: Object.values(data['Max Weight by Year']).toString(), // Add point labels
              }],
            };
          setSiteData({ id: siteName, ...data, popularityData, weightData });
        } else {
          setError(`No site found with name: ${siteName}`);
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
  return (
    <div className="min-h-screen flex justify-center items-center bg-opacity-50 bg-gray-100">
      <Spinner />
    </div>
  );
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
        {user && (
          <Link to="#" onClick={() => navigate(-1)} className="text-gray-700 hover:text-gray-900 transition duration-150 ease-in-out">Back</Link>
        )}
      </div>
      <SiteDetailsCard data={siteData} popularityData={siteData.popularityData} weightData={siteData.weightData} />
    </div>
  </div>
);
};

export default SiteProfile;
