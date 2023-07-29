import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Spinner from '../Spinner';
import { Line } from 'react-chartjs-2';

// Component for displaying site details
const SiteDetailsCard = ({ data, popularityData, weightData }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <h1>{data.id}</h1>
    <p><b>Site Record:</b> {data['Site Record']}</p>
    <p><b>Total Entries:</b> {data['Total Entries']}</p>
    <p><b>Entries by Year:</b></p>
    <Line data={popularityData} />
    <p><b>Max Weight by Year:</b></p>
    <Line data={weightData} />
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
