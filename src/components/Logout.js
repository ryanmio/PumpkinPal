import React from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { Button } from '../../components/ui/button'; // Adjust the import path as necessary
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation

function Logout() {
  const router = useRouter(); // Use the useRouter hook

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Successfully signed out');
      // Use the router to navigate to the login page after successful sign out
      router.push('/login');
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

