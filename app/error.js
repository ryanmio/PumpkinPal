'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { trackError, GA_CATEGORIES, GA_ACTIONS } from './utilities/error-analytics'; // Import GA utilities

export default function Error({ error, reset }) {
  const router = useRouter(); // Use useRouter to access router properties

  useEffect(() => {
    // Log the error to Google Analytics
    trackError(error, router.pathname, GA_CATEGORIES.SYSTEM, GA_ACTIONS.ERROR);
    console.error(error); // Keep the console.error for local debugging
  }, [error, router.pathname]);

  // Style the component to match the rest of the app
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}> 
      <h2>Something went wrong!</h2>
      <button
        onClick={() => reset()}
        style={{ padding: '10px', marginTop: '20px' }}
      >
        Try again
      </button>
    </div>
  );
}