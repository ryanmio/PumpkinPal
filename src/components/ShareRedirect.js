import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ShareRedirect = () => {
  const { imageId } = useParams(); // Using imageId to match the document ID

  useEffect(() => {
    // Redirecting to the cloud function URL with the image ID
    const cloudFunctionUrl = `https://api.pumpkinpal.app/renderSharedImage/${imageId}`;
    window.location.replace(cloudFunctionUrl);
  }, [imageId]);

  return <div>Redirecting...</div>;
};

export default ShareRedirect;
