import React, { useState, useEffect } from 'react';
import 'chart.js/auto';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import Dashboard from './components/Dashboard';
import PumpkinForm from './components/PumpkinForm';
import EditPumpkin from './components/EditPumpkin';
import AddMeasurement from './components/AddMeasurement';
import PumpkinDetail from './components/PumpkinDetail';
import Homepage from './components/Homepage';
import UserProfile from './components/UserProfile';
import EditMeasurement from './components/EditMeasurement';
import Dashboardv2 from './components/Dashboardv2';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);
    
    
  return (
    <div className="App">
      <Router>
        <header className="App-header">
          <div className="nav-bar">
            <div className="nav-row">
              <img src="/logo192.png" alt="Logo" className="App-logo" />
              {currentUser ? (
                <>
                  <span>User: {currentUser.email}</span>
                  <Logout className="logout-button"/>
                </>
              ) : (
                <Link to="/login" className="logout-button">Login</Link>
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
       <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-pumpkin" element={<PumpkinForm />} />
          <Route path="/edit-pumpkin/:id" element={<EditPumpkin />} />
          <Route path="/add-measurement/:id" element={<AddMeasurement />} />
          <Route path="/pumpkin/:id" element={<PumpkinDetail />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/edit-measurement/:pumpkinId/:measurementId" element={<EditMeasurement />} />
          <Route path="/dashboardv2" element={<Dashboardv2 />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;