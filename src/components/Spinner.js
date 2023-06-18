import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center" role="status">
      <svg aria-hidden="true" className="w-12 h-12 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92V15c0-2.21-3.13-4-7-4-3.87 0-7 1.79-7 4v1.92"></path>
        <path d="M2 12h20a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-8l1-2h-6l1 2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2z"></path>
        <line x1="6" y1="9" x2="6" y2="9"></line>
        <line x1="10" y1="9" x2="10" y2="9"></line>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
