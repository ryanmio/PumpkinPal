import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Spinner from '../Spinner';
import { Line } from 'react-chartjs-2';

// Component for displaying site details
const SiteDetailsCard = ({ data, popularityData, weightData }) => {
  const uniqueYears = Object.keys(data['Popularity by Year']).length;

  return (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <h1>{data.id}</h1>
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div style={{backgroundColor: '#FFD699'}} className="p-6 rounded text-center">
        <h2 className="text-lg font-bold mb-2">Site Record (lbs)</h2>
        <p className="text-2xl">{data['Site Record']}</p>
      </div>
      <div style={{backgroundColor: '#FFD699'}} className="p-6 rounded text-center">
        <h2 className="text-lg font-bold mb-2">Total Entries</h2>
        <p className="text-2xl">{data['Total Entries']}</p>
      </div>
      <div style={{backgroundColor: '#FFD699'}} className="p-6 rounded text-center">
        <h2 className="text-lg font-bold mb-2">Unique Years</h2>
        <p className="text-2xl">{uniqueYears}</p>
      </div>
    </div>
    <p><b>Entries by Year:</b></p>
    <Line data={popularityData} />
    <p><b>Max Weight by Year:</b></p>
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


const SiteProfile = () => {
  const { id } = useParams();
  const siteName = id.replace(/_/g, ' ');
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        <SiteDetailsCard data={siteData} popularityData={siteData.popularityData} weightData={siteData.weightData} />
      </div>
    </div>
  );
};

export default SiteProfile;
