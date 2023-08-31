/* global FB */
import React, { useState, useEffect, useContext } from 'react';
import { storage, db } from '../firebase';
import { toast } from 'react-hot-toast';
import PlusIcon from './icons/PlusIcon';
import { UserContext } from '../contexts/UserContext';
import { updateDoc, collection, doc, getDoc, addDoc } from 'firebase/firestore';
import { ref } from 'firebase/storage';
import Modal from 'react-modal';
import Button from '../utilities/Button';
import Spinner from '../components/Spinner';
import { deleteObject } from 'firebase/storage';
import { differenceInDays } from 'date-fns';
import { trackUserEvent, trackError, GA_ACTIONS, GA_CATEGORIES } from '../utilities/error-analytics';
import { useDropzone } from 'react-dropzone';
import { showDeleteConfirmation } from '../components/Alert';
import uploadImage from '../utilities/uploadImage';

const ImageCard = ({ pumpkinId, pumpkinName }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);

  const calculateLatestWeight = async (pumpkinId) => {
  // Fetch the pumpkin document
  const pumpkinDoc = await getDoc(doc(db, 'Users', user.uid, 'Pumpkins', pumpkinId));
  const pumpkinData = pumpkinDoc.data();

  // Check if the 'weights' field is defined
  if (pumpkinData && pumpkinData.weights && pumpkinData.weights.length > 0) {
    // Calculate the latest weight
    const latestWeight = pumpkinData.weights[pumpkinData.weights.length - 1].weight;
    console.log('Latest weight:', latestWeight);
    return latestWeight;
  } else {
    console.log('No weights field found or it is empty in the pumpkin document.');
    return null;
  }
};

const calculateDaysAfterPollination = async (pumpkinId, shareDate) => {
  // Fetch the pumpkin document
  const pumpkinDoc = await getDoc(doc(db, 'Users', user.uid, 'Pumpkins', pumpkinId));
  const pumpkinData = pumpkinDoc.data();

  // Check if the 'pollinationDate' field is defined
  if (pumpkinData && pumpkinData.pollinationDate) {
    // Convert pollinationDate to a Date object if it's a string
    const pollinationDate = new Date(pumpkinData.pollinationDate);

    // Calculate the days after pollination using shareDate
    const daysAfterPollination = differenceInDays(shareDate, pollinationDate);
    console.log('Days after pollination:', daysAfterPollination);
    return daysAfterPollination;
  } else {
    console.log('No pollinationDate field found in the pumpkin document.');
    return null;
  }
};

  const addSharedImage = async (imageUrl, pumpkinId, userId, pumpkinName) => {
  // Define the share date
  const shareDate = new Date();

  // Calculate the latest weight and days after pollination using the share date
  const latestWeight = await calculateLatestWeight(pumpkinId);
  const daysAfterPollination = await calculateDaysAfterPollination(pumpkinId, shareDate);

  // Add the document to the SharedImages collection
  try {
    const docRef = await addDoc(collection(db, 'SharedImages'), {
      image: imageUrl,
      pumpkinId: pumpkinId,
      userId: userId,
      pumpkinName: pumpkinName,
      latestWeight: latestWeight,
      daysAfterPollination: daysAfterPollination,
      timestamp: shareDate
    });
    console.log('Document written with ID: ', docRef.id);
    return docRef.id; // Return the document ID
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

  const handleShare = async () => {
  if (typeof FB === 'undefined') {
    toast.error('Facebook share is blocked by an ad blocker. Please disable it to share the image.');
    return;
  }

  const imageToShare = images.find(imageObj => imageObj.original === selectedImage);
  if (!imageToShare) return;

  // Create a loading toast
  const toastId = toast.loading('Creating sharable link...');

  try {
    const sharedImageId = await addSharedImage(imageToShare.original, pumpkinId, user.uid, pumpkinName);
    const shareableLink = `https://release-v0-6-0--pumpkinpal.netlify.app/share/${sharedImageId}`;
    const shareContent = {
      method: 'share',
      href: shareableLink,
      quote: `Check out my pumpkin ${pumpkinName}!`,
      description: `Latest weight: ${imageToShare.latestWeight} | Days after Pollination: ${imageToShare.daysAfterPollination}`,
      picture: imageToShare.original
    };

    // Dismiss the loading toast
    toast.dismiss(toastId);

    // Open the Facebook share dialog
    FB.ui(shareContent, function(response) {
        if (response && !response.error_message) {
          trackUserEvent(GA_ACTIONS.Share_Success, GA_CATEGORIES.ImageCard);
          toast.success('Image shared successfully.');
        } else {
          trackError('Failed to share image', GA_CATEGORIES.ImageCard, 'handleShare', GA_ACTIONS.Share_Failure);
          toast.error('Failed to share image. Please try again.');
        }
      });
  } catch (e) {
    // If there's an error, dismiss the loading toast and show an error toast
    trackError('Failed to create sharable link', GA_CATEGORIES.ImageCard, 'handleShare', GA_ACTIONS.Share_Failure);
    toast.dismiss(toastId);
    toast.error('Failed to create sharable link. Please try again.');
  }
};

  const handleDownload = async () => {
  try {
    // Find the image object to download
    const imageToDownload = images.find(imageObj => imageObj.original === selectedImage);
    if (!imageToDownload) return;

    // Get the original image URL
    const originalURL = imageToDownload.original;

    // Extract the extension from the URL
    const extension = originalURL.split('.').pop().split('?')[0];

    // Get the pumpkin name from the prop
    const name = pumpkinName;

    // Generate a filename using the pumpkin name and original extension
    const filename = `PumpkinPal_${name}.${extension}`;

    // Fetch the image as a Blob
    const response = await fetch(originalURL);

    // Check for a 200 status code
    if (response.status !== 200) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();

    // Create a URL for the Blob
    const blobURL = URL.createObjectURL(blob);

    // Create the download link with the desired filename
    const downloadLink = document.createElement('a');
    downloadLink.href = blobURL;
    downloadLink.download = filename;

    // Append the link, trigger the download, and then remove the link
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Revoke the blob URL to free up resources
    URL.revokeObjectURL(blobURL);
  trackUserEvent(GA_ACTIONS.Download_Success, GA_CATEGORIES.ImageCard);
    } catch (error) {
    trackError('Failed to download image', GA_CATEGORIES.ImageCard, 'handleDownload', GA_ACTIONS.Download_Failure);
    console.error('Error downloading image:', error);
    toast.error('Failed to download image. Please try again.');
  }
};

  const handleDelete = async () => {
  showDeleteConfirmation('Delete Image', 'Are you sure you want to delete this image?', async () => {
    try {
    // Find the image object to delete
    const imageToDelete = images.find(imageObj => imageObj.original === selectedImage);
    if (!imageToDelete) return;

    // Delete the original image and thumbnail from storage
    const originalRef = ref(storage, imageToDelete.original);
    const thumbnailRef = ref(storage, imageToDelete.thumbnail);
    await deleteObject(originalRef);
    await deleteObject(thumbnailRef);

    // Update the Firestore document
    const updatedImages = images.filter(imageObj => imageObj !== imageToDelete);
    const usersCollection = collection(db, 'Users');
    const userDoc = doc(usersCollection, user.uid);
    const pumpkinsCollection = collection(userDoc, 'Pumpkins');
    const pumpkinRef = doc(pumpkinsCollection, pumpkinId);
    await updateDoc(pumpkinRef, { images: updatedImages });

    // Update the local state
    setImages(updatedImages);

    // Close the modal
    closeModal();

    // Show a success toast
    toast.success('Image deleted successfully.');
  trackUserEvent(GA_ACTIONS.Delete_Success, GA_CATEGORIES.ImageCard);
    } catch (error) {
      trackError('Failed to delete image', GA_CATEGORIES.ImageCard, 'handleDelete', GA_ACTIONS.Delete_Failure);
    console.error('Error deleting image:', error);
    toast.error('Failed to delete image. Please try again.');
  }
  });
};
    
  const openModal = (image) => {
  setSelectedImage(image);
  setIsModalOpen(true);
  setIsLoading(true);

  // Preload the image and listen for the load event
  const img = new Image();
  img.src = image;
  img.onload = () => {
    setIsLoading(false);
  };
};

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    let isMounted = true; // Track whether the component is mounted

    const fetchImages = async () => {
      try {
        const usersCollection = collection(db, 'Users');
        const userDoc = doc(usersCollection, user.uid);
        const pumpkinsCollection = collection(userDoc, 'Pumpkins');
        const pumpkinRef = doc(pumpkinsCollection, pumpkinId);

        const pumpkinDoc = await getDoc(pumpkinRef);
        if (pumpkinDoc.exists() && isMounted) {
          setImages(pumpkinDoc.data().images || []);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error('Failed to fetch images. Please try again.');
      }
    };

    fetchImages();

    return () => {
      isMounted = false; // Cleanup
    };
  }, [user.uid, pumpkinId]);

  const handleUpload = async ([file]) => {
  try {
    const updatedImages = await uploadImage(file, pumpkinId, user.uid, db, storage);
    setImages(updatedImages);
  } catch (error) {
    console.error('Error uploading image:', error);
  }
};

const { getRootProps, getInputProps } = useDropzone({ onDrop: handleUpload });

return (
  <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto mb-12">
    <h3 className="text-xl font-bold mb-4">Image Gallery</h3>
    <div className="grid grid-cols-2 gap-4">
      {images.map((imageObj, index) => (
        <div key={index} onClick={() => openModal(imageObj.original)} className="w-full aspect-ratio-square relative">
          <img src={imageObj.thumbnail} alt="Preview" className="w-full h-full object-cover absolute top-0 left-0" loading="lazy" />
        </div>
      ))}
      <div {...getRootProps()} className="w-full flex justify-center items-center border-2 border-dashed border-gray-400 rounded cursor-pointer hover:bg-gray-100 aspect-ratio-square relative">
        <input {...getInputProps()} className="hidden" />
        <div className="w-full h-full flex justify-center items-center absolute top-0 left-0">
          <PlusIcon className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    </div>
    <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="flex flex-col items-center justify-center bg-white rounded-lg p-4 max-w-lg mx-auto mt-20">
      <button onClick={closeModal} className="self-start text-xl font-bold">&times;</button>
      {isLoading ? (
        <Spinner />
      ) : (
        <img src={selectedImage} alt="Selected" className="max-w-full max-h-64 object-contain" />
      )}
      <div className="flex space-x-4 mt-4">
        <Button onClick={handleShare}>Share to Facebook</Button>
        <Button onClick={handleDownload}>Download</Button>
        <Button onClick={handleDelete}>Delete</Button>
      </div>
    </Modal>
  </div>
);
};

export default ImageCard;