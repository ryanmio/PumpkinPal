import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db, Timestamp } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function EditMeasurement() {
  const { pumpkinId, measurementId } = useParams();
  const navigate = useNavigate();

  const [endToEnd, setEndToEnd] = useState('');
  const [sideToSide, setSideToSide] = useState('');
  const [circumference, setCircumference] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('cm');
  const [measurementDate, setMeasurementDate] = useState(new Date());

  useEffect(() => {
    const fetchMeasurement = async () => {
      if (auth.currentUser) {
        const measurementRef = doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', pumpkinId, 'Measurements', measurementId);
        const measurementDoc = await getDoc(measurementRef);
        if (measurementDoc.exists()) {
          const data = measurementDoc.data();
          setEndToEnd(data.endToEnd);
          setSideToSide(data.sideToSide);
          setCircumference(data.circumference);
          setMeasurementUnit(data.measurementUnit);
          setMeasurementDate(data.timestamp.toDate());
        }
      }
    };
    fetchMeasurement();
  }, [pumpkinId, measurementId]);

  const calculateEstimatedWeight = (endToEnd, sideToSide, circumference) => {
    let ott = endToEnd + sideToSide + circumference;
    if (measurementUnit === 'cm') {
      ott /= 2.54;  // Convert cm to inches
    }
    const weight = (((14.2 / (1 + 7.3 * Math.pow(2, -(ott) / 96))) ** 3 + (ott / 51) ** 2.91) - 8) * 0.993;
    return weight.toFixed(2);  // round to 2 decimal places
  };

  const editMeasurement = async (e) => {
    e.preventDefault();
    const estimatedWeight = calculateEstimatedWeight(endToEnd, sideToSide, circumference);

    const measurementRef = doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', pumpkinId, 'Measurements', measurementId);
    await updateDoc(measurementRef, {
      endToEnd,
      sideToSide,
      circumference,
      measurementUnit,
      estimatedWeight,
      timestamp: Timestamp.fromDate(measurementDate),
    });

    navigate(`/pumpkin/${pumpkinId}`);
  };

  return (
    <div>
      <h2>Edit Measurement</h2>
      <form onSubmit={editMeasurement}>
        <label>
          End to End:
          <input type="number" value={endToEnd} onChange={(e) => setEndToEnd(parseFloat(e.target.value))} required />
        </label>
        <label>
          Side to Side:
          <input type="number" value={sideToSide} onChange={(e) => setSideToSide(parseFloat(e.target.value))} required />
        </label>
        <label>
          Circumference:
          <input type="number" value={circumference} onChange={(e) => setCircumference(parseFloat(e.target.value))} required />
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
        <button type="submit">Save Changes</button>
        <button type="button" onClick={() => navigate(`/pumpkin/${pumpkinId}`)}>Cancel</button>
      </form>
    </div>
  );
}

export default EditMeasurement;
