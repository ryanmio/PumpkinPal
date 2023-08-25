import React, { useContext } from 'react'; // import useContext
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logout from './Logout';
import { UserContext } from '../contexts/UserContext'; // import UserContext

function Header() {
  const currentUser = useContext(UserContext); // get the current user from UserContext
  const location = useLocation();
  const navigate = useNavigate();

  // Check if the current route is for the ImageDisplay component
  const isImageDisplayRoute = location.pathname.startsWith('/image/');

  // Don't render the header if the current route is for the ImageDisplay component
  if (isImageDisplayRoute) {
    return null;
  }

  return (
    <header className="App-header">
      <div className="nav-bar">
        <div className="nav-row">
          <Link to={currentUser ? "/dashboard" : "/"}>
            <img src="/logowide.png" alt="Logo" className="App-logo" style={{ paddingLeft: currentUser ? "0px" : "20px" }} />
          </Link>
          {location.pathname === "/" && !currentUser ? (
            <div style={{ marginLeft: 'auto', paddingRight: '20px', marginTop: '0px', marginBottom: '0px' }}>
              <button className="logout-button login-button" onClick={() => navigate('/login')}>
                Login
              </button>
            </div>
          ) : (
            <>
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
