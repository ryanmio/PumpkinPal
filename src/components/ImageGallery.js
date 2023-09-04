import React from 'react';
import PlusIcon from './icons/PlusIcon';
import { useDropzone } from 'react-dropzone';

const ImageGallery = ({ images, openModal, handleUpload }) => {
  const { getRootProps, getInputProps } = useDropzone({ onDrop: handleUpload });

  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((imageObj, index) => (
        <div key={index} onClick={() => openModal(imageObj.original)} className="w-full aspect-ratio-square relative">
          <img src={imageObj.thumbnail} alt="Preview" className="w-full h-full rounded-lg object-cover absolute top-0 left-0" loading="lazy" />
        </div>
      ))}
      <div {...getRootProps()} className="w-full flex justify-center items-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-100 aspect-ratio-square relative">
        <input {...getInputProps()} className="hidden" />
        <PlusIcon className="h-8 w-8 text-gray-400" />
      </div>
    </div>
  );
};

export default ImageGallery;
