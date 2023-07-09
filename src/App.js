import React, { useState, useEffect } from 'react';
import 'chart.js/auto';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import ReactGA from "react-ga4";

// Initialize GA once when the App.js module is loaded
ReactGA.initialize(process.env.REACT_APP_TRACKING_ID);

function TrackPageViews() {
  const location = useLocation();
  
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname, title: document.title });
  }, [location]);

  return null;
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const RegisterComponent = <Register />;
  const LoginComponent = <Login />;
  const DashboardComponent = <Dashboard />;
  const PumpkinFormComponent = <PumpkinForm />;
  const EditPumpkinComponent = <EditPumpkin />;
  const AddMeasurementComponent = <AddMeasurement />;
  const PumpkinDetailComponent = <PumpkinDetail />;
  const HomepageComponent = <Homepage />;
  const UserProfileComponent = <UserProfile />;
  const EditMeasurementComponent = <EditMeasurement />;

  return (
    <div className="App font-lato">
      <Router>
        <TrackPageViews />
        <Header currentUser={currentUser} />
        <Toaster />
        <Routes>
          <Route path="/register" element={RegisterComponent} />
          <Route path="/login" element={LoginComponent} />
          <Route path="/dashboard" element={DashboardComponent} />
          <Route path="/add-pumpkin" element={PumpkinFormComponent} />
          <Route path="/edit-pumpkin/:id" element={EditPumpkinComponent} />
          <Route path="/add-measurement/:id" element={AddMeasurementComponent} />
          <Route path="/pumpkin/:id" element={PumpkinDetailComponent} />
          <Route path="/" element={HomepageComponent} />
          <Route path="/user-profile" element={UserProfileComponent} />
          <Route path="/edit-measurement/:pumpkinId/:measurementId" element={EditMeasurementComponent} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
