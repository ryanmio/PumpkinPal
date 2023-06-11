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
          <h1>Welcome to PumpkinPal</h1>
          {currentUser && (
            <nav>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/add-pumpkin">Add Pumpkin</Link>
              <span>User: {currentUser.email}</span>
              <Logout />
            </nav>
          )}
        </header>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-pumpkin" element={<PumpkinForm />} />
          <Route path="/edit-pumpkin/:id" element={<EditPumpkin />} />
          <Route path="/add-measurement/:id" element={<AddMeasurement />} />
          <Route path="/pumpkin/:id" element={<PumpkinDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
