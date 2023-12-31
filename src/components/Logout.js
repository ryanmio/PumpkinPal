import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="relative px-2 py-1 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-100 rounded-lg shadow-inner group focus:outline-none whitespace-nowrap overflow-hidden"
      style={{ '--hover-bg-color': '#4A4F40', minWidth: '70px' }}>
      <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-full ease"></span>
      <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-full ease"></span>
      <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 group-hover:h-full ease" style={{ backgroundColor: 'var(--hover-bg-color)' }}></span>
      <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 group-hover:h-full ease" style={{ backgroundColor: 'var(--hover-bg-color)' }}></span>
      <span className="absolute inset-0 w-full h-full duration-300 delay-300 opacity-0 group-hover:opacity-100" style={{ backgroundColor: 'var(--hover-bg-color)' }}></span>
      <span className="relative transition-colors duration-300 delay-200 group-hover:text-white ease">Sign Out</span>
    </button>
  );
}

export default Logout;
