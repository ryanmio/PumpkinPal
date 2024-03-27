import React from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { Button } from './button'; // Adjust the import path as necessary
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation

function Logout() {
  const router = useRouter(); // Use the useRouter hook

  const handleLogout = async () => {
    try {
      // Redirect to the login page
      router.push('/login');
      // Sign out the user
      await signOut(auth);
      console.log('Successfully signed out');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Button 
      onClick={handleLogout} 
      variant="customSmall" // This now includes black text color
      size="xs"
    >
      Sign Out
    </Button>
  );
}

export default Logout;

