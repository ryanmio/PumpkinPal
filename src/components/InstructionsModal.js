import React from 'react';
import Modal from 'react-modal';

const InstructionsModal = ({ isOpen, closeModal }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="OTT Measurement Instructions"
      ariaHideApp={false}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center border-b-2 p-4">
          <h2 className="text-xl">OTT Measurement Instructions</h2>
          <button onClick={closeModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <img src="imageUrl" alt="Instruction" />
            <div>
              <h3>Instruction 1</h3>
              <p>Details for instruction 1...</p>
            </div>
          </div>

          {/* Repeat the above structure for the other instructions */}
        </div>

        <div className="flex justify-end items-center border-t-2 p-4">
          <button className="btn btn-primary" onClick={closeModal}>Close</button>
        </div>
      </div>
    </Modal>
  );
};

export default InstructionsModal;
