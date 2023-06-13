import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db, Timestamp } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function AddMeasurement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [endToEnd, setEndToEnd] = useState('');
  const [sideToSide, setSideToSide] = useState('');
  const [circumference, setCircumference] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('cm'); // Changed default to 'cm' for consistency
  const [measurementDate, setMeasurementDate] = useState(new Date());

  useEffect(() => {
    const fetchPreferences = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'Users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const fetchedUnit = userDoc.data().preferredUnit;
          if (fetchedUnit) {
            setMeasurementUnit(fetchedUnit);
          }
        }
      }
    };
    fetchPreferences();
  }, []);

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

    const measurementId = Date.now().toString();

    await setDoc(doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', id, 'Measurements', measurementId), {
      endToEnd,
      sideToSide,
      circumference,
      measurementUnit,
      estimatedWeight,
      timestamp: Timestamp.fromDate(measurementDate),
    });

    navigate(`/pumpkin/${id}`);
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
            <option value="in">in</option>
            <option value="cm">cm</option>
          </select>
        </label>
        <label>
          Measurement Date:
          <DatePicker selected={measurementDate} onChange={(date) => setMeasurementDate(date)} />
        </label>
        <br />
        <button type="submit">Save Measurement</button>
        <button type="button" onClick={() => navigate('/dashboard')}>Cancel</button>
      </form>
    </div>
  );
}

export default AddMeasurement;
