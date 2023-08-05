import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you're using react-router
import { db } from '../firebase'; // Import your Firebase setup
import Spinner from '../components/Spinner'; // Import your Spinner component
import { doc, getDoc } from 'firebase/firestore';
// import { Helmet } from 'react-helmet';

const ImageDisplay = () => {
  const { imageId } = useParams(); // Get the image ID from the URL
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the image details based on the imageId
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
    return <Spinner />; // Show spinner while loading
  }

  if (!imageData) {
  return <div>Image not found</div>; // Handle image not found
}

  return (
    <div>
      <img src={imageData.image} alt="Shared" />
    </div>
  );
};

export default ImageDisplay;
