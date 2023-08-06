import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const ShareRedirect = () => {
  const { imageId } = useParams(); // Using imageId to match the document ID

  useEffect(() => {
    const fetchSharedImageUrl = async () => {
      try {
        const sharedImageRef = doc(db, 'SharedImages', imageId);
        const sharedImageDoc = await getDoc(sharedImageRef);

        if (sharedImageDoc.exists()) {
          const sharedImageUrl = sharedImageDoc.data().image; // Getting the image URL
          window.location.replace(sharedImageUrl);
        } else {
          console.error('Shared image not found');
        }
      } catch (error) {
        console.error('Error fetching shared image:', error);
      }
    };

    fetchSharedImageUrl();
  }, [imageId]);

  return <div>Redirecting...</div>;
};

export default ShareRedirect;
