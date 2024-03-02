import React, { useContext } from 'react';
import Link from 'next/link'; // Import from next/link instead of react-router-dom
import { UserContext } from '../../contexts/UserContext';
import Logout from './Logout';
import MenuIcon from './icons/MenuIcon';
import SignInButton from './SignInButton';

const links = [
  { href: '/dashboard', label: 'Dashboard', Icon: require('./icons/DashboardIcon').default },
  { href: '/add-pumpkin', label: 'New Pumpkin', Icon: require('./icons/AddPumpkinIcon').default },
  // Note: Dynamic routes in Next.js are handled differently. You might need to adjust how you handle dynamic segments like :id
  { href: '/add-measurement/[id]', label: 'New Measurement', Icon: require('./icons/AddMeasurementIcon').default },
  { href: '/search', label: 'Search', Icon: require('./icons/SearchIcon').default },
  { href: '/my-stats', label: 'My Stats', Icon: require('./icons/MyStatsIcon').default },
  { href: '/user-profile', label: 'User Settings', Icon: require('./icons/SettingsIcon').default }
];

function Sidebar({ isOpen, toggleSidebar }) {
  const { user: currentUser } = useContext(UserContext);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center">
          {currentUser && (
            <button
              onClick={toggleSidebar}
              aria-controls="logo-sidebar"
              type="button"
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon color="white" />
            </button>
          )}
        </div>
          <div className="flex items-center justify-center w-full">
            <Link href={currentUser ? "/dashboard" : "/"} passHref>
              <a><img src="/logowide.png" alt="Logo" className="App-logo" /></a>
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
        <aside id="logo-sidebar" className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${currentUser && isOpen ? 'open' : 'closed'} bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`} aria-label="Sidebar">
          <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
            <ul className="space-y-2 font-medium pl-0">
              {links.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link href={href} passHref>
                    <a className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group link">
                      <Icon className="icon-hover" />
                      <span className="ml-3">{label}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </>
  );
}

export default Sidebar;
