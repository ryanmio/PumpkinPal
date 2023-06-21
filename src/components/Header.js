import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logout from './Logout';

function Header({ currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="App-header">
      <div className="nav-bar">
        <div className="nav-row">
          <img src="/logowide.png" alt="Logo" className="App-logo" />
          {location.pathname === "/" && !currentUser ? (
             <div style={{ marginLeft: 'auto', paddingRight: '20px', marginTop: '0px', marginBottom: '0px' }}>
              <button className="logout-button login-button" onClick={() => navigate('/login')}>
                Login
              </button>
            </div>
          ) : (
            <>
              <span>{currentUser ? `${currentUser.email}` : ''}</span>
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
