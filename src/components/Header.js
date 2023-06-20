import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logout from './components/Logout';

function Header({ currentUser }) {
  const location = useLocation();
  return (
    <header className="App-header">
      <div className="nav-bar">
        <div className="nav-row">
          {currentUser ? (
            <>
              <img src="/logo192.png" alt="Logo" className="App-logo" />
              <span>User: {currentUser.email}</span>
              <Logout className="logout-button"/>
            </>
          ) : (
            location.pathname === '/' && (
              <Link to="/login" className="logout-button">Login</Link>
            )
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
