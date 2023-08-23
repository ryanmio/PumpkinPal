import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Logout from './Logout';
import MenuIcon from './icons/MenuIcon';
import DashboardIcon from './icons/DashboardIcon';
import AddPumpkinIcon from './icons/AddPumpkinIcon';
import AddMeasurementIcon from './icons/AddMeasurementIcon';
import SettingsIcon from './icons/SettingsIcon';
import MyStatsIcon from './icons/MyStatsIcon';
import SearchIcon from './icons/SearchIcon';
import SignInButton from './SignInButton';


function Sidebar({ isOpen, toggleSidebar }) {
  const { user: currentUser } = useContext(UserContext);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-#80876E border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
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
              <SignInButton />
            )}
          </div>
        </div>
      </nav>
      {currentUser && (
      <aside id="logo-sidebar" className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${currentUser ? (isOpen ? 'open' : 'closed') : 'closed'} bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`} aria-label="Sidebar">
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
          <ul className="space-y-2 font-medium pl-0">
            <li>
              <Link to="/dashboard" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group link">
                <DashboardIcon className="icon-hover"/>

                <span className="ml-3">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/add-pumpkin" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group link">
                <AddPumpkinIcon className="icon-hover"/>
                <span className="ml-3">New Pumpkin</span>
              </Link>
            </li>
            <li>
              <Link to="/add-measurement/:id" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group link">
                <AddMeasurementIcon className="icon-hover"/>
                <span className="ml-3">New Measurement</span>
              </Link>
            </li>
            <li>
              <Link to="/search" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group link">
                <SearchIcon className="icon-hover"/>
                <span className="ml-3">Search</span>
              </Link>
            </li>
            <li>
              <Link to="/my-stats" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group link">
                <MyStatsIcon className="icon-hover"/>
                <span className="ml-3">My Stats</span>
              </Link>
            </li>
            <li>
              <Link to="/user-profile" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group link">
                <SettingsIcon className="icon-hover"/>
                <span className="ml-3">User Settings</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
        )}
    </>
  );
}

export default Sidebar;
