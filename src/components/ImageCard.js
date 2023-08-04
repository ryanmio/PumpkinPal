import React, { useState, useEffect, useContext } from 'react';
import { storage, db } from '../firebase';
import { toast } from 'react-hot-toast';
import PlusIcon from './icons/PlusIcon';
import { UserContext } from '../contexts/UserContext';
import { updateDoc, arrayUnion, collection, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Modal from 'react-modal';
import Button from '../utilities/Button';

const ImageCard = ({ pumpkinId }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(UserContext);

  const handleShare = () => {
    // Share logic here
  };

  const handleDownload = () => {
    // Download logic here
  };

  const handleDelete = () => {
    // Delete logic here
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleUpload(file);
    }
  };

  const handleUpload = async (image) => {
    try {
      const storagePath = `UserImages/${pumpkinId}/${image.name}`;
      const storageRef = ref(storage, storagePath);
      const metadata = { contentType: image.type };
      const uploadTask = uploadBytesResumable(storageRef, image, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // You can add progress tracking here if needed
        },
        (error) => {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image. Please try again.');
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const usersCollection = collection(db, 'Users');
            const userDoc = doc(usersCollection, user.uid);
            const pumpkinsCollection = collection(userDoc, 'Pumpkins');
            const pumpkinRef = doc(pumpkinsCollection, pumpkinId);

            // Update the pumpkin document with the new download URL
            updateDoc(pumpkinRef, { images: arrayUnion(downloadURL) });
            setImages(prevImages => [...prevImages, downloadURL]);
            toast.success('Image uploaded successfully.');
          });
        }
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto mb-12">
      <h3 className="text-xl font-bold mb-4">Image Gallery</h3>
      <div className="grid grid-cols-2 gap-4">
        {images.map((url, index) => (
          <div key={index} onClick={() => openModal(url)}>
            <img src={url} alt="Preview" className="w-full h-64 object-cover" loading="lazy" />
          </div>
        ))}
        <label className="w-full h-64 flex justify-center items-center border-2 border-dashed border-gray-400 rounded cursor-pointer hover:bg-gray-100">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
          <PlusIcon className="h-8 w-8 text-gray-400" />
        </label>
      </div>
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="flex flex-col items-center justify-center bg-white rounded-lg p-4 max-w-lg mx-auto mt-10">
        <button onClick={closeModal} className="absolute top-4 right-4 text-xl font-bold">&times;</button>
        <img src={selectedImage} alt="Selected" className="max-w-full max-h-64 object-contain" />
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