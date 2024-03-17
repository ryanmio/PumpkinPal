// app/image/[imageId]/page.js
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '../../../firebase';
import Spinner from '../../../components/ui/Spinner';
import { doc, getDoc } from 'firebase/firestore';
import Head from 'next/head';
import sanitizeHtml from 'sanitize-html';

// this component wasnt used in the original CRA app, instead it redirected to a cloud html page with the meta tags i.e. https://api.pumpkinpal.app/renderSharedImage/2Jbma4UETB7xd6HSqdnA

const ImageDisplay = () => {
  const router = useRouter();
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
      <Head>
        <title>{sanitizedPumpkinName}</title>
        <meta name="description" content={`Latest weight: ${sanitizedLatestWeight} | Days after Pollination: ${sanitizedDaysAfterPollination}`} />
        <meta property="og:title" content={sanitizedPumpkinName} />
        <meta property="og:description" content={`Latest weight: ${sanitizedLatestWeight} | Days after Pollination: ${sanitizedDaysAfterPollination}`} />
        <meta property="og:image" content={imageData.image} />
        <meta property="og:url" content={router.asPath} />
      </Head>
      <img src={imageData.image} alt="Shared" />
    </div>
  );
};

export default ImageDisplay;

