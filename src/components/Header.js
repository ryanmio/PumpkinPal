import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logout from './Logout';
import Login from './Login';

function Header({ currentUser }) {
  const location = useLocation();
  
  return (
    <header className="App-header">
      <div className="nav-bar">
        <div className="nav-row">
          {location.pathname === "/" && !currentUser ? (
            <Link to="/login" className="logout-button">Login</Link>
          ) : (
            <>
              <img src="/logo192.png" alt="Logo" className="App-logo" />
              <span>User: {currentUser ? `User: ${currentUser.email}` : ''}</span>
              {currentUser && <Logout className="logout-button"/>}
            </>
          )}
        </div>
        {currentUser && (
          <div className="nav-row">
            <Link className="nav-link" to="/dashboard">Dashboard</Link>
            <Link className="nav-link" to="/user-profile">User Profile</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
