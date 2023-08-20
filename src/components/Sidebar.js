import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/user-profile">User Profile</Link>
      <Link to="/add-pumpkin">Add Pumpkin</Link>
      <Link to="/my-stats">My Stats</Link>
      {/* Add more links for other routes here */}
    </div>
  );
}

export default Sidebar;
