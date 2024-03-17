import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db, Timestamp } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import "react-datepicker/dist/react-datepicker.css";
import MeasurementInput from '../../app/add-measurement/[id]/MeasurementInput';
import DateInput from './DateInput';

function EditMeasurement() {
  const { pumpkinId, measurementId } = useParams();
  const navigate = useNavigate();

  const [pumpkinName, setPumpkinName] = useState('');
  const [endToEnd, setEndToEnd] = useState('');
  const [sideToSide, setSideToSide] = useState('');
  const [circumference, setCircumference] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('cm');
  const [measurementDate, setMeasurementDate] = useState(new Date());
  const [isToday, setIsToday] = useState(true);

  const handleEndToEndChange = (e) => setEndToEnd(e.target.value);
  const handleSideToSideChange = (e) => setSideToSide(e.target.value);
  const handleCircumferenceChange = (e) => setCircumference(e.target.value);

    useEffect(() => {
  const fetchMeasurementAndPumpkin = async () => {
    if (auth.currentUser) {
      const measurementRef = doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', pumpkinId, 'Measurements', measurementId);
      const measurementDoc = await getDoc(measurementRef); 
      if (measurementDoc.exists()) {
        const data = measurementDoc.data();
        setEndToEnd(parseFloat(data.endToEnd));
        setSideToSide(parseFloat(data.sideToSide));
        setCircumference(parseFloat(data.circumference));
        setMeasurementUnit(data.measurementUnit);
        setMeasurementDate(new Date(data.timestamp.seconds * 1000)); // convert Firestore timestamp to JS Date

        const pumpkinRef = doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', pumpkinId);
        const pumpkinDoc = await getDoc(pumpkinRef); 
        if (pumpkinDoc.exists()) {
          setPumpkinName(pumpkinDoc.data().name);
        }
      }
    }
  };
  fetchMeasurementAndPumpkin();
}, [pumpkinId, measurementId]);

const calculateEstimatedWeight = (endToEnd, sideToSide, circumference, measurementUnit) => {
    let ott = parseFloat(endToEnd) + parseFloat(sideToSide) + parseFloat(circumference);
    if (measurementUnit === 'cm') {
      ott /= 2.54;  // Convert cm to inches
    }
    const weight = (((14.2 / (1 + 7.3 * Math.pow(2, -(ott) / 96))) ** 3 + (ott / 51) ** 2.91) - 8) * 0.993;
    return weight.toFixed(2);  // round to 2 decimal places
  };
  const calculateOTT = () => {
    if(endToEnd && sideToSide && circumference) {
      return parseFloat(endToEnd) + parseFloat(sideToSide) + parseFloat(circumference);
    }
    return 0;
  };

  const editMeasurement = async (e) => {
    e.preventDefault();
    const estimatedWeight = calculateEstimatedWeight(endToEnd, sideToSide, circumference, measurementUnit);
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
    <div className="container mx-auto px-4 h-screen pt-10">
      <div className="bg-white shadow overflow-hidden rounded-lg p-4 w-full md:max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Edit Measurement</h2>
        <form onSubmit={editMeasurement} className="space-y-4">
          <input type="text" value={pumpkinName} readOnly className="mt-1 w-full p-2 border-2 border-gray-300 bg-gray-200 rounded" />
          <MeasurementInput 
            id="endToEnd"
            placeholder="End to End"
            onChange={handleEndToEndChange}
            min={0} 
            max={500}
            value={endToEnd} 
          />
          <MeasurementInput 
            id="sideToSide"
            placeholder="Side to Side"
            onChange={handleSideToSideChange}
            min={0} 
            max={500}
            value={sideToSide} 
          />
          <MeasurementInput 
            id="circumference"
            placeholder="Circumference"
            onChange={handleCircumferenceChange}
            min={0} 
            max={1000}
            value={circumference} 
          />
          <DateInput 
            id="measurementDate"
            selected={measurementDate}
            onChange={(date) => {
              setMeasurementDate(date);
              setIsToday(
                date.getDate() === new Date().getDate() && 
                date.getMonth() === new Date().getMonth() && 
                date.getFullYear() === new Date().getFullYear()
              );
            }} 
            isToday={isToday}
          />
          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => navigate(`/pumpkin/${pumpkinId}`)} className="text-blue-600 hover:underline">Cancel</button>
            <button type="submit" className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              {calculateOTT() !== 0 ? `Save Changes (OTT = ${calculateOTT()})` : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMeasurement;