import React from 'react';
import Modal from 'react-modal';
import Button from '../utilities/Button';
import Spinner from '../components/Spinner';

const ImageModal = ({ isOpen, closeModal, selectedImage, isLoading, handleShare, handleDownload, handleDelete }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal} className="flex flex-col items-center justify-center bg-white rounded-lg p-4 max-w-lg mx-auto mt-20">
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
  );
};

export default ImageModal;
