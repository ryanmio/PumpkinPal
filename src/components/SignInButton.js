import React from 'react';
import { useNavigate } from 'react-router-dom';

function SignInButton() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login'); // Redirect to the login page
  };

  return (
    <button
      onClick={handleSignIn}
      className="relative px-2 py-1 text-sm font-medium text-white bg-gray-100 border border-gray-100 rounded-lg shadow-inner group focus:outline-none whitespace-nowrap overflow-hidden" // Updated text color to white
      style={{ '--hover-bg-color': '#4A4F40', minWidth: '70px' }}
    >
      <span className="absolute top-0 left-0 w-full h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-0 ease"></span>
      <span className="absolute bottom-0 right-0 w-full h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-0 ease"></span>
      <span className="absolute top-0 left-0 w-full h-full transition-all duration-300 delay-200 group-hover:h-0 ease rounded-lg" style={{ backgroundColor: 'var(--hover-bg-color)' }}></span>
      <span className="absolute bottom-0 left-0 w-full h-full transition-all duration-300 delay-200 group-hover:h-0 ease rounded-lg" style={{ backgroundColor: 'var(--hover-bg-color)' }}></span>
      <span className="absolute inset-0 w-full h-full duration-300 delay-300 opacity-0 group-hover:opacity-100" style={{ backgroundColor: 'var(--hover-bg-color)' }}></span>
      <span className="relative transition-colors duration-300 delay-200 group-hover:text-white ease">Sign In</span>
    </button>
  );
}

export default SignInButton;
