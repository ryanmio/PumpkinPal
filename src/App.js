import React from 'react';
import 'chart.js/auto';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login'; // Ensure you have this component
import Dashboard from './components/Dashboard'; // import your new component
import PumpkinForm from './components/PumpkinForm';
import EditPumpkin from './components/EditPumpkin';
import AddMeasurement from './components/AddMeasurement';
import PumpkinDetail from './components/PumpkinDetail';



function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to PumpkinPal</h1>
        <Router>
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
      </header>
    </div>
  );
}

export default App;
