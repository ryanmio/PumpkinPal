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
      className="relative px-4 py-1 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-100 rounded-lg shadow-inner group focus:outline-none whitespace-nowrap hover:bg-#4A4F40 hover:text-white" // Added hover background color and text color
      style={{ minWidth: '60px' }} // Minimum width
    >
      <span className="absolute inset-0 transition-all duration-300 delay-300 bg-gray-900 opacity-0 group-hover:opacity-100 rounded-lg"></span> {/* Background effect */}
      <span className="relative z-10">Sign Out</span> {/* Text with higher z-index */}
    </button>
  );
}

export default Logout;
