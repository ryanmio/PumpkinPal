import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Spinner from '../Spinner';

// Component for displaying site details
const SiteDetailsCard = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4">
    <h1>{data.id}</h1> 
    <p><b>Site Record:</b> {data['Site Record']}</p>
    <p><b>Total Entries:</b> {data['Total Entries']}</p>
    <p><b>Popularity by Year:</b> {JSON.stringify(data['Popularity by Year'])}</p>
    <p><b>Max Weight by Year:</b> {JSON.stringify(data['Max Weight by Year'])}</p>
  </div>
);

const SiteProfile = () => {
  const { id } = useParams();
  const siteName = id.replace(/_/g, ' ');
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const docRef = doc(db, 'Stats_Sites', siteName);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSiteData({ id: siteName, ...docSnap.data() });
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
        <SiteDetailsCard data={siteData} />
      </div>
    </div>
  );
};

export default SiteProfile;
