import React, { useState } from 'react';
import { storage } from '../firebase'; // Assuming Firebase storage is exported from firebase.js
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/solid'; // You can use any plus icon

const ImageCard = ({ pumpkinId }) => {
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImages([...images, file]);
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls([...previewUrls, e.target.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    try {
      const downloadUrls = [];
      for (const image of images) {
        // Define the storage path
        const storagePath = `path/to/storage/${pumpkinId}/${image.name}`;
        const storageRef = storage.ref(storagePath);
        const snapshot = await storageRef.put(image);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        downloadUrls.push(downloadUrl);
        // Placeholder: Save the URL to Firestore or other relevant location
      }
      toast.success('Images uploaded successfully.');
      // You can set the download URLs to the state or handle them as needed
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto mb-12">
      <h3 className="text-xl font-bold mb-2">Image Gallery</h3>
      <div className="grid grid-cols-3 gap-4">
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
      <button
        onClick={handleUpload}
        className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mt-4"
      >
        Upload
      </button>
    </div>
  );
};

export default ImageCard;
