import React, { useState, useContext } from 'react';
import { storage, db } from '../firebase';
import { toast } from 'react-hot-toast';
import PlusIcon from './icons/PlusIcon';
import { UserContext } from '../contexts/UserContext';
import { updateDoc, arrayUnion } from 'firebase/firestore';
import { ref } from 'firebase/storage'; // Import the ref function

const ImageCard = ({ pumpkinId }) => {
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const { user } = useContext(UserContext);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImages([...images, file]);
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls([...previewUrls, e.target.result]);
      };
      reader.readAsDataURL(file);
      await handleUpload(file); // Call handleUpload here
    }
  };

  const handleUpload = async (image) => {
    try {
      // Define the storage path
      const storagePath = `gs://pumpkinpal-b60be.appspot.com/UserImages/${pumpkinId}/${image.name}`;
      const storageRef = ref(storage, storagePath); // Use the ref function with the storage object
      const snapshot = await storageRef.put(image);
      const downloadUrl = await snapshot.ref.getDownloadURL();

      // Get a reference to the specific pumpkin document
      const pumpkinRef = db.collection('Users').doc(user.uid).collection('Pumpkins').doc(pumpkinId);

      // Update the pumpkin document with the new download URL
      await updateDoc(pumpkinRef, {
        images: arrayUnion(downloadUrl) // Use arrayUnion to add the URL to an array field
      });

      toast.success('Image uploaded successfully.');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto mb-12">
      <h3 className="text-xl font-bold mb-4">Image Gallery</h3>
      <div className="grid grid-cols-2 gap-4">
        {previewUrls.map((url, index) => (
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
