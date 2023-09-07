import React, { useState, useEffect } from 'react';
import 'chart.js/auto';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import { Toaster } from 'react-hot-toast';
import ReactGA from "react-ga4";
import { UserProvider } from './contexts/UserContext';
import { GrowerContextProvider } from './contexts/GrowerContext';
import GrowerStatsProfile from './components/GrowerStatsProfile/GrowerStatsProfile';
import GrowerSearch from './components/GrowerStatsProfile/GrowerSearch';
import Search from './components/GrowerStatsProfile/Search';
import MyStats from './components/GrowerStatsProfile/MyStats';
import CloudFunctionTrigger from './components/GrowerStatsProfile/CloudFunctionTrigger';
import PumpkinDetails from './components/GrowerStatsProfile/PumpkinDetails';
import SiteProfile from './components/GrowerStatsProfile/SiteProfile';
import ImageDisplay from './components/ImageDisplay';
import ShareRedirect from './components/ShareRedirect';
import Sidebar from './components/Sidebar';


// Initialize GA once when the App.js module is loaded
ReactGA.initialize(process.env.REACT_APP_TRACKING_ID);

function TrackPageViews() {
  const location = useLocation();
  
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname, title: document.title });
  }, [location]);

  return null;
}

function PrivateRoute({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`App font-lato ${isSidebarOpen ? '' : 'closed'}`}>
      <Router>
        <UserProvider>
          <GrowerContextProvider>
            <TrackPageViews />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className={`main-content ${isSidebarOpen ? 'open' : 'closed'}`} onClick={() => setIsSidebarOpen(false)}>
              <Toaster />
              <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <PrivateRoute path="/dashboard" element={<Dashboard />} />
                <PrivateRoute path="/add-pumpkin" element={<PumpkinForm />} />
                <PrivateRoute path="/edit-pumpkin/:id" element={<EditPumpkin />} />
                <PrivateRoute path="/add-measurement/:id" element={<AddMeasurement />} />
                <PrivateRoute path="/pumpkin/:id" element={<PumpkinDetail />} />
                <Route path="/" element={<Homepage />} />
                <PrivateRoute path="/user-profile" element={<UserProfile />} />
                <PrivateRoute path="/edit-measurement/:pumpkinId/:measurementId" element={<EditMeasurement />} />
                <Route path="/grower/:growerName" element={<GrowerStatsProfile />} />
                <Route path="/growersearch" element={<GrowerSearch />} />
                <PrivateRoute path="/search" element={<Search />} />
                <PrivateRoute path="/my-stats" element={<MyStats />} />
                <PrivateRoute path="/cloudadmin" element={<CloudFunctionTrigger />} />
                <Route path="/pumpkin-details/:id" element={<PumpkinDetails />} />
                <Route path="/site-profile/:id" element={<SiteProfile />} />
                <Route path="/image/:imageId" element={<ImageDisplay />} />
                <Route path="/share/:imageId" element={<ShareRedirect />} />
              </Routes>
            </div>
          </GrowerContextProvider>
        </UserProvider>
      </Router>
    </div>
  );
}

export default App;
