import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to the login page after successful sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="relative px-2 py-1 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-100 rounded-lg shadow-inner group focus:outline-none overflow-hidden" // Added overflow-hidden
    >
      <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-full ease rounded-lg"></span> {/* Added border radius */}
      <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-full ease rounded-lg"></span> {/* Added border radius */}
      <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease rounded-lg"></span> {/* Added border radius */}
      <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease rounded-lg"></span> {/* Added border radius */}
      <span className="absolute inset-0 w-full h-full duration-300 delay-300 bg-gray-900 opacity-0 group-hover:opacity-100 rounded-lg"></span> {/* Added border radius */}
      <span className="relative transition-colors duration-300 delay-200 group-hover:text-white ease">Logout</span>
    </button>
  );
}

export default Logout;
