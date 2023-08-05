import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, query, orderBy, limit, collection } from '../firebase';
import Spinner from '../components/Spinner';
import { doc, getDoc, getDocs } from 'firebase/firestore';
import { Helmet } from 'react-helmet';

const ImageDisplay = () => {
  const { imageId } = useParams();
  const [imageData, setImageData] = useState(null);
  const [pumpkinData, setPumpkinData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        const sharedImageRef = doc(db, 'SharedImages', imageId);
        const sharedImageDoc = await getDoc(sharedImageRef);

        if (sharedImageDoc.exists()) {
          setImageData(sharedImageDoc.data());

          const pumpkinRef = doc(db, 'Users', sharedImageDoc.data().userId, 'Pumpkins', sharedImageDoc.data().pumpkinId);
          const pumpkinDoc = await getDoc(pumpkinRef);

          if (pumpkinDoc.exists()) {
            const pumpkinData = pumpkinDoc.data();

            const measurementsCollection = collection(db, 'Users', sharedImageDoc.data().userId, 'Pumpkins', sharedImageDoc.data().pumpkinId, 'Measurements');
            const measurementsQuery = query(measurementsCollection, orderBy('timestamp', 'desc'), limit(1));
            const measurementSnapshot = await getDocs(measurementsQuery);

            const latestMeasurement = measurementSnapshot.docs[0]?.data() || null;

            pumpkinData.latestMeasurement = latestMeasurement;
            setPumpkinData(pumpkinData);
          } else {
            console.error('Pumpkin not found');
          }
        } else {
          console.error('Image not found');
        }
      } catch (error) {
        console.error('Error fetching image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageDetails();
  }, [imageId]);

  function daysSincePollination(pollinationDateStr) {
    const pollinationDate = new Date(pollinationDateStr);
    const oneDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    const diffDays = Math.round(Math.abs((now - pollinationDate) / oneDay)) - 1;
    return diffDays;
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (!imageData || !pumpkinData) {
    return <div>Image not found</div>;
  }

  return (
    <div>
      <Helmet>
        <title>{pumpkinData.name}</title>
        <meta name="description" content={`Weight: ${pumpkinData.latestMeasurement.estimatedWeight}, Days After Pollination: ${daysSincePollination(pumpkinData.pollinated)}`} />
        <meta property="og:description" content={`Weight: ${pumpkinData.latestMeasurement.estimatedWeight}, Days After Pollination: ${daysSincePollination(pumpkinData.pollinated)}`} />
        <meta property="og:image" content={imageData.image} />
      </Helmet>
      <img src={imageData.image} alt="Shared" />
    </div>
  );
};

export default ImageDisplay;
