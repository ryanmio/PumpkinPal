import React from 'react';

// Define a simple loading skeleton component
// This can be replaced with a more detailed skeleton or spinner based on your design
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="min-h-screen flex flex-col justify-start items-center space-y-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header Placeholder */}
        <div className="h-12 bg-gray-300 rounded-md"></div>
        {/* Summary Section Placeholder */}
        <div className="mt-4 h-8 bg-gray-300 rounded-md"></div>
        <div className="mt-2 h-8 bg-gray-300 rounded-md"></div>
        <div className="mt-2 h-8 bg-gray-300 rounded-md"></div>
        {/* Table Section Placeholder */}
        <div className="mt-8">
          <div className="h-6 bg-gray-300 rounded-md"></div>
          <div className="mt-2 h-6 bg-gray-300 rounded-md"></div>
          <div className="mt-2 h-6 bg-gray-300 rounded-md"></div>
          <div className="mt-2 h-6 bg-gray-300 rounded-md"></div>
        </div>
      </div>
    </div>
  </div>
);

// Export the loading component
export default function Loading() {
  return <LoadingSkeleton />;
}