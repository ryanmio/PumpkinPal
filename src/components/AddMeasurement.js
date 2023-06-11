import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db, Timestamp } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function AddMeasurement() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Define state variables for each measurement attribute.
  const [endToEnd, setEndToEnd] = useState('');
  const [sideToSide, setSideToSide] = useState('');
  const [circumference, setCircumference] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('inches');
  const [measurementDate, setMeasurementDate] = useState(new Date());

  const calculateEstimatedWeight = (endToEnd, sideToSide, circumference) => {
    let ott = endToEnd + sideToSide + circumference;
    if (measurementUnit === 'cm') {
      ott /= 2.54;  // Convert cm to inches
    }
    const weight = (((14.2 / (1 + 7.3 * Math.pow(2, -(ott) / 96))) ** 3 + (ott / 51) ** 2.91) - 8) * 0.993;
    return weight.toFixed(2);  // round to 2 decimal places
  };

  const addMeasurement = async (e) => {
    e.preventDefault();
    const estimatedWeight = calculateEstimatedWeight(endToEnd, sideToSide, circumference);

    // Generate a unique ID for the new measurement.
    const measurementId = Date.now().toString();

    await setDoc(doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', id, 'Measurements', measurementId), {
      endToEnd,
      sideToSide,
      circumference,
      measurementUnit,
      estimatedWeight,
      timestamp: Timestamp.fromDate(measurementDate),
    });

    navigate(`/pumpkin/${id}`); // Navigate to the details page of the current pumpkin after adding a measurement
  };

  return (
    <div>
      <h2>Add a Measurement</h2>
      <form onSubmit={addMeasurement}>
        <label>
          End to End:
          <input type="number" onChange={(e) => setEndToEnd(parseFloat(e.target.value))} required />
        </label>
        <label>
          Side to Side:
          <input type="number" onChange={(e) => setSideToSide(parseFloat(e.target.value))} required />
        </label>
        <label>
          Circumference:
          <input type="number" onChange={(e) => setCircumference(parseFloat(e.target.value))} required />
        </label>
        <label>
          Measurement Unit:
          <select value={measurementUnit} onChange={(e) => setMeasurementUnit(e.target.value)}>
            <option value="inches">Inches</option>
            <option value="cm">Centimeters</option>
          </select>
        </label>
        <label>
          Measurement Date:
          <DatePicker selected={measurementDate} onChange={(date) => setMeasurementDate(date)} />
        </label>
        <br />
        <button type="submit">Save Measurement</button>
        <button type="button" onClick={() => navigate('/dashboard')}>Cancel</button> {/* New Button */}
      </form>
    </div>
  );
}

export default AddMeasurement;
