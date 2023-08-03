import React, { useState } from 'react';
import { storage } from '../firebase'; // Assuming Firebase storage is exported from firebase.js
import { toast } from 'react-hot-toast';
import PlusIcon from './icons/PlusIcon';

const ImageCard = ({ pumpkinId }) => {
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls([...previewUrls, e.target.result]);
      };
      reader.readAsDataURL(file);

      // Define the storage path
      const storagePath = `path/to/storage/${pumpkinId}/${file.name}`;
      const storageRef = storage.ref(storagePath);
      try {
        await storageRef.put(file);
        toast.success('Image uploaded successfully.');
        // Placeholder: Save the URL to Firestore or other relevant location
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto mb-12">
      <h3 className="text-xl font-bold mb-2">Image Gallery</h3>
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