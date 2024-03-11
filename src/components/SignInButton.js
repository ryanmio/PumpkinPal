import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';

function SignInButton() {
  const router = useRouter(); // Use the useRouter hook

  const handleSignIn = () => {
    // Use the router to navigate to the login page
    router.push('/login');
  };

  return (
    <Button 
      onClick={handleSignIn} 
      variant="customSmall" // Match the variant from Logout.js
      size="xs" // Match the size from Logout.js
      className="relative px-2 py-1 text-sm font-medium text-black bg-gray-100 border border-gray-100 rounded-lg shadow-inner group focus:outline-none whitespace-nowrap overflow-hidden"
      style={{ '--hover-bg-color': '#4A4F40', minWidth: '70px' }}
    >
      Sign In {/* Adjusted to match the text style in Logout.js */}
    </Button>
  );
}

export default SignInButton;
