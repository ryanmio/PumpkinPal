import React, { useState } from 'react';
import { storage } from '../firebase'; // Assuming Firebase storage is exported from firebase.js
import { toast } from 'react-hot-toast';

const ImageCard = ({ pumpkinId }) => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Preview the selected image (optional)
      const reader = new FileReader();
      reader.onload = (e) => {
        setUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (image) {
      // Placeholder: Define the storage path
      const storagePath = `path/to/storage/${pumpkinId}/${image.name}`;
      const storageRef = storage.ref(storagePath);
      try {
        const snapshot = await storageRef.put(image);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        setUrl(downloadUrl);
        // Placeholder: Save the URL to Firestore or other relevant location
        toast.success('Image uploaded successfully.');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image. Please try again.');
      }
    } else {
      toast.error('Please select an image to upload.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col overflow-x-auto mb-12">
      <h3 className="text-xl font-bold mb-2">Add Photo</h3>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
      />
      {url && <img src={url} alt="Preview" className="w-full h-64 object-cover" />}
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
