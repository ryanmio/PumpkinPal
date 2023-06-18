import React from 'react';

const Spinner = () => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
      <div className="px-4 py-5 sm:px-6 flex justify-between">
        <div>
          <div className="animate-pulse">
            <h3 className="text-lg leading-6 font-medium text-gray-900 bg-gray-200 rounded">Loading...</h3>
            <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
          </div>
          <div className="absolute top-2/4 left-1/2" role="status">
            <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spinner;
