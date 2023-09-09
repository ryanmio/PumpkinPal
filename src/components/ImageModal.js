/* global FB */
import React, { useRef, useState } from 'react';
import Modal from 'react-modal';
import Button from '../utilities/Button';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';
import { trackUserEvent, trackError, GA_ACTIONS, GA_CATEGORIES } from '../utilities/error-analytics';
import { showDeleteConfirmation } from '../components/Alert';
import { addDoc, collection, updateDoc, getDoc, doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { differenceInDays } from 'date-fns';
import FullscreenIcon from './icons/FullscreenIcon';

const ImageModal = ({ isOpen, closeModal, selectedImage, isLoading, images, pumpkinId, user, pumpkinName, db, storage, updateImages }) => {
  const modalRef = useRef(null);
  const imageRef = useRef(null);
  const [isFullscreen, setFullscreen] = useState(false);

React.useEffect(() => {
  const changeHandler = () => {
    setFullscreen(!!document.fullscreenElement);
  };

  document.addEventListener("fullscreenchange", changeHandler);
  return () => document.removeEventListener("fullscreenchange", changeHandler);
}, []);
  
  const calculateLatestWeight = async () => {
    const pumpkinDoc = await getDoc(doc(db, 'Users', user.uid, 'Pumpkins', pumpkinId));
    const pumpkinData = pumpkinDoc.data();
    if (pumpkinData && pumpkinData.weights && pumpkinData.weights.length > 0) {
      const latestWeight = pumpkinData.weights[pumpkinData.weights.length - 1].weight;
      return latestWeight;
    } else {
      return null;
    }
  };

  const calculateDaysAfterPollination = async () => {
    const pumpkinDoc = await getDoc(doc(db, 'Users', user.uid, 'Pumpkins', pumpkinId));
    const pumpkinData = pumpkinDoc.data();
    if (pumpkinData && pumpkinData.pollinationDate) {
      const pollinationDate = new Date(pumpkinData.pollinationDate);
      const shareDate = new Date();
      const daysAfterPollination = differenceInDays(shareDate, pollinationDate);
      return daysAfterPollination;
    } else {
      return null;
    }
  };

  const addSharedImage = async (imageUrl) => {
    const shareDate = new Date();
    const latestWeight = await calculateLatestWeight();
    const daysAfterPollination = await calculateDaysAfterPollination();
    try {
      const docRef = await addDoc(collection(db, 'SharedImages'), {
        image: imageUrl,
        pumpkinId: pumpkinId,
        userId: user.uid,
        pumpkinName: pumpkinName,
        latestWeight: latestWeight,
        daysAfterPollination: daysAfterPollination,
        timestamp: shareDate
      });
      return docRef.id;
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
    const toastId = toast.loading('Creating sharable link...');
    try {
      const sharedImageId = await addSharedImage(imageToShare.original);
      const shareableLink = `https://release-v0-6-0--pumpkinpal.netlify.app/share/${sharedImageId}`;
      const shareContent = {
        method: 'share',
        href: shareableLink,
        quote: `Check out my pumpkin ${pumpkinName}!`,
        description: `Latest weight: ${imageToShare.latestWeight} | Days after Pollination: ${imageToShare.daysAfterPollination}`,
        picture: imageToShare.original
      };
      toast.dismiss(toastId);
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
      trackError('Failed to create sharable link', GA_CATEGORIES.ImageCard, 'handleShare', GA_ACTIONS.Share_Failure);
      toast.dismiss(toastId);
      toast.error('Failed to create sharable link. Please try again.');
    }
  };

  const handleDownload = async () => {
    try {
      const imageToDownload = images.find(imageObj => imageObj.original === selectedImage);
      if (!imageToDownload) return;
      const originalURL = imageToDownload.original;
      const extension = originalURL.split('.').pop().split('?')[0];
      const name = pumpkinName;
      const filename = `PumpkinPal_${name}.${extension}`;
      const response = await fetch(originalURL);
      if (response.status !== 200) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const blob = await response.blob();
      const blobURL = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobURL;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobURL);
      trackUserEvent(GA_ACTIONS.Download_Success, GA_CATEGORIES.ImageCard);
    } catch (error) {
      trackError('Failed to download image', GA_CATEGORIES.ImageCard, 'handleDownload', GA_ACTIONS.Download_Failure);
      toast.error('Failed to download image. Please try again.');
    }
  };

  const handleDelete = async () => {
    showDeleteConfirmation('Delete Image', 'Are you sure you want to delete this image?', async () => {
      try {
        const imageToDelete = images.find(imageObj => imageObj.original === selectedImage);
        if (!imageToDelete) return;
        const originalRef = ref(storage, imageToDelete.original);
        const thumbnailRef = ref(storage, imageToDelete.thumbnail);
        await deleteObject(originalRef);
        await deleteObject(thumbnailRef);
        const updatedImages = images.filter(imageObj => imageObj !== imageToDelete);
        const usersCollection = collection(db, 'Users');
        const userDoc = doc(usersCollection, user.uid);
        const pumpkinsCollection = collection(userDoc, 'Pumpkins');
        const pumpkinRef = doc(pumpkinsCollection, pumpkinId);
        await updateDoc(pumpkinRef, { images: updatedImages });
          updateImages(updatedImages);  // New line
          closeModal();
        toast.success('Image deleted successfully.');
        trackUserEvent(GA_ACTIONS.Delete_Success, GA_CATEGORIES.ImageCard);
      } catch (error) {
        trackError('Failed to delete image', GA_CATEGORIES.ImageCard, 'handleDelete', GA_ACTIONS.Delete_Failure);
        toast.error('Failed to delete image. Please try again.');
      }
    });
  };
    
  const toggleFullscreen = () => {
    setFullscreen(prevState => !prevState);
  };

  return (
    <Modal 
    isOpen={isOpen} 
    onRequestClose={closeModal} 
    className={`flex flex-col items-center justify-center bg-white rounded-lg p-4 max-w-lg mx-auto mt-20`}
  >
    <div ref={modalRef} className="relative w-full flex flex-col items-center">
      <button onClick={closeModal} className="absolute top-0 left-0 text-xl font-bold">&times;</button>
      <button onClick={toggleFullscreen} className="absolute top-0 right-0 hover:scale-110 hover:text-gray-700 transition duration-300 ease-in-out">
        <FullscreenIcon alt="Toggle Fullscreen" className="w-7 h-7 text-gray-500 icon-hover" />
      </button>
      {isLoading ? (
        <Spinner />
      ) : (
        <img 
          ref={imageRef}
          src={selectedImage} 
          alt="Selected" 
          className={`object-contain ${isFullscreen ? 'fixed top-0 left-0 w-screen h-screen z-50' : 'max-w-full max-h-64'}`} 
        />
      )}
      <div className="flex space-x-4 mt-4">
        <Button onClick={handleShare}>Share to Facebook</Button>
        <Button onClick={handleDownload}>Download</Button>
        <Button onClick={handleDelete}>Delete</Button>
      </div>
    </div>
  </Modal>
);
};

export default ImageModal;