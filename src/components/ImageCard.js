import React, { useState, useEffect, useContext } from 'react';
import { storage, db } from '../firebase';
import { toast } from 'react-hot-toast';
import { UserContext } from '../contexts/UserContext';
import { collection, getDoc } from 'firebase/firestore';
import uploadImage from '../utilities/uploadImage';
import ImageGallery from './ImageGallery';
import ImageModal from './ImageModal';

const ImageCard = ({ pumpkinId, pumpkinName }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
    setIsLoading(true);

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
    let isMounted = true;

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
        toast.error('Failed to fetch images. Please try again.');
      }
    };

    fetchImages();

    return () => {
      isMounted = false;
    };
  }, [user.uid, pumpkinId]);

  const handleUpload = async ([file]) => {
    try {
      const updatedImages = await uploadImage(file, pumpkinId, user.uid, db, storage);
      setImages(updatedImages);
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto mb-12">
      <h3 className="text-xl font-bold mb-4">Image Gallery</h3>
      <ImageGallery images={images} openModal={openModal} handleUpload={handleUpload} />
      <ImageModal 
        isOpen={isModalOpen} 
        closeModal={closeModal} 
        selectedImage={selectedImage} 
        isLoading={isLoading}
        images={images}
        pumpkinId={pumpkinId}
        user={user}
        pumpkinName={pumpkinName}
        db={db}
        storage={storage}
      />
    </div>
  );
};

export default ImageCard;
