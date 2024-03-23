import React from 'react';
import Spinner from '../../../components/ui/Spinner';

// Export the loading component that uses Spinner, centered on the page
export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner />
    </div>
  );
}
