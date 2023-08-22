import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Logout from './Logout';
import MenuIcon from './icons/MenuIcon';

function Sidebar({ isOpen, toggleSidebar }) {
  const currentUser = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-#80876E border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"> {/* Updated color */}
        <div className="flex items-center justify-between px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              aria-controls="logo-sidebar"
              type="button"
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon color="white" />
            </button>
          </div>
          <div className="flex items-center justify-center w-full"> {/* Centered logo */}
            <Link to={currentUser ? "/dashboard" : "/"}>
              <img src="/logowide.png" alt="Logo" className="App-logo" />
            </Link>
          </div>
          <div className="flex items-center">
            {currentUser ? (
              <Logout className="logout-button" />
            ) : (
              <button className="logout-button login-button" onClick={() => navigate('/login')}>
                Login
              </button>
            )}
          </div>
        </div>
      </nav>
      <aside id="logo-sidebar" className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${isOpen ? 'open' : 'closed'} bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`} aria-label="Sidebar">
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            <li>
              <Link to="/dashboard" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                {/* Add icon here */}
                <span className="ml-3">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/add-pumpkin" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                {/* Add icon here */}
                <span className="ml-3">Add Pumpkin</span>
              </Link>
            </li>
            {/* Add other links here */}
          </ul>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
