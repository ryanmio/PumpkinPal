import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import Spinner from '../components/Spinner';
import { doc, getDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet';
import sanitizeHtml from 'sanitize-html';

const ImageDisplay = () => {
  const { imageId } = useParams();
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        const sharedImageRef = doc(db, 'SharedImages', imageId);
        const sharedImageDoc = await getDoc(sharedImageRef);

        if (sharedImageDoc.exists()) {
          setImageData(sharedImageDoc.data());
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

  if (isLoading) {
    return <Spinner />;
  }

  if (!imageData) {
    return <div>Image not found</div>;
  }

  // Sanitize metadata
  const sanitizedPumpkinName = imageData.pumpkinName ? sanitizeHtml(imageData.pumpkinName) : '';
  const sanitizedLatestWeight = imageData.latestWeight ? sanitizeHtml(imageData.latestWeight.toString()) : '';
  const sanitizedDaysAfterPollination = imageData.daysAfterPollination ? sanitizeHtml(imageData.daysAfterPollination.toString()) : '';

  return (
    <div>
      <Helmet>
        <title>{sanitizedPumpkinName}</title>
        <meta name="description" content={`Latest weight: ${sanitizedLatestWeight} | Days after Pollination: ${sanitizedDaysAfterPollination}`} />
        <meta property="og:title" content={sanitizedPumpkinName} />
        <meta property="og:description" content={`Latest weight: ${sanitizedLatestWeight} | Days after Pollination: ${sanitizedDaysAfterPollination}`} />
        <meta property="og:image" content={imageData.image} />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <img src={imageData.image} alt="Shared" />
    </div>
  );
};

export default ImageDisplay;
