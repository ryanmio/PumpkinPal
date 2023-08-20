import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <aside id="default-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        <ul className="space-y-2 font-medium">
          <li>
            <Link to="/dashboard" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <i className="bi bi-speedometer2 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"></i>
              <span className="ml-3">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/add-pumpkin" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <i className="bi bi-plus-circle w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"></i>
              <span className="ml-3">Add Pumpkin</span>
            </Link>
          </li>
          {/* Add other links here */}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
