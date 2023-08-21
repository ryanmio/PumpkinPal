import React, { useContext } from 'react'; // import useContext
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext'; // import UserContext
import Logout from './Logout';

function Sidebar({ isOpen, toggleSidebar }) {
  const currentUser = useContext(UserContext); // get the current user from UserContext
  const navigate = useNavigate();

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-start">
            <Link to={currentUser ? "/dashboard" : "/"}>
              <img src="/logowide.png" alt="Logo" className="App-logo" style={{ paddingLeft: currentUser ? "0px" : "20px" }} />
            </Link>
            <button
              onClick={toggleSidebar}
              aria-controls="logo-sidebar"
              type="button"
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
              </svg>
            </button>
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
