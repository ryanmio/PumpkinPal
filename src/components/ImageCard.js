import React, { useState, useEffect, useContext } from 'react';
import { storage, db } from '../firebase';
import { toast } from 'react-hot-toast';
import PlusIcon from './icons/PlusIcon';
import { UserContext } from '../contexts/UserContext';
import { updateDoc, arrayUnion, collection, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const ImageCard = ({ pumpkinId }) => {
  const [images, setImages] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchImages = async () => {
      const usersCollection = collection(db, 'Users');
      const userDoc = doc(usersCollection, user.uid);
      const pumpkinsCollection = collection(userDoc, 'Pumpkins');
      const pumpkinRef = doc(pumpkinsCollection, pumpkinId);

      const pumpkinDoc = await getDoc(pumpkinRef);
      if (pumpkinDoc.exists()) {
        setImages(pumpkinDoc.data().images || []);
      }
    };

    fetchImages();
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
          <img key={index} src={url} alt="Preview" className="w-full h-64 object-cover" />
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
    </div>
  );
};

export default ImageCard;
