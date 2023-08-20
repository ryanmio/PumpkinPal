import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <Link to="/">Your Logo</Link>
      </div>
      <div className="sidebar-menu">
        <Link to="/dashboard" className="sidebar-link">
          <i className="bi bi-speedometer2"></i>
          Dashboard
        </Link>
        <Link to="/add-pumpkin" className="sidebar-link">
          <i className="bi bi-plus-circle"></i>
          Add Pumpkin
        </Link>
        <Link to="/add-measurement/:id" className="sidebar-link">
          <i className="bi bi-ruler"></i>
          Add Measurement
        </Link>
        <Link to="/" className="sidebar-link">
          <i className="bi bi-house"></i>
          Homepage
        </Link>
        <Link to="/user-profile" className="sidebar-link">
          <i className="bi bi-person"></i>
          User Profile
        </Link>
        <Link to="/search" className="sidebar-link">
          <i className="bi bi-search"></i>
          Search
        </Link>
        <Link to="/my-stats" className="sidebar-link">
          <i className="bi bi-graph-up"></i>
          My Stats
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
