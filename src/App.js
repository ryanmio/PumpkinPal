import React, { useState, useEffect } from 'react';
import 'chart.js/auto';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PumpkinForm from './components/PumpkinForm';
import EditPumpkin from './components/EditPumpkin';
import AddMeasurement from './components/AddMeasurement';
import PumpkinDetail from './components/PumpkinDetail';
import Homepage from './components/Homepage';
import UserProfile from './components/UserProfile';
import EditMeasurement from './components/EditMeasurement';
import Header from './components/Header';
import { Toaster } from 'react-hot-toast';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App font-lato">
      <Router>
        <Header currentUser={currentUser} />
        <Toaster />
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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
