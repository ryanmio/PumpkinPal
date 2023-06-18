import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db, Timestamp, onAuthStateChanged } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function AddMeasurement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pumpkins, setPumpkins] = useState([]);
  const [selectedPumpkin, setSelectedPumpkin] = useState('');
  const [endToEnd, setEndToEnd] = useState('');
  const [sideToSide, setSideToSide] = useState('');
  const [circumference, setCircumference] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('cm'); 
  const [measurementDate, setMeasurementDate] = useState(new Date());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        const userRef = doc(db, 'Users', user.uid);
        const userDoc = await getDoc(userRef);
        const fetchedUnit = userDoc.exists() ? userDoc.data().preferredUnit : 'cm';
        setMeasurementUnit(fetchedUnit);

        const q = collection(db, 'Users', user.uid, 'Pumpkins');
        const snapshot = await getDocs(q);
        const pumpkinsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPumpkins(pumpkinsData);

        if (id) {
          setSelectedPumpkin(id);
        } else if (pumpkinsData.length > 0) {
          setSelectedPumpkin(pumpkinsData[0].id);
        }
      }
    });
    return () => unsubscribe();
  }, [id]);

  const calculateEstimatedWeight = (endToEnd, sideToSide, circumference) => {
    let ott = endToEnd + sideToSide + circumference;
    if (measurementUnit === 'cm') {
      ott /= 2.54;  // Convert cm to inches
    }
    const weight = (((14.2 / (1 + 7.3 * Math.pow(2, -(ott) / 96))) ** 3 + (ott / 51) ** 2.91) - 8) * 0.993;
    return weight.toFixed(2);  // round to 2 decimal places
  };

  const calculateOTT = () => {
    let ott = endToEnd + sideToSide + circumference;
    return isNaN(ott) ? 0 : ott;  // Return 0 if ott is NaN
  }

  const addMeasurement = async (e) => {
    e.preventDefault();
    const estimatedWeight = calculateEstimatedWeight(endToEnd, sideToSide, circumference);

    const measurementId = Date.now().toString();
    const user = auth.currentUser;

    if(user) {
      await setDoc(doc(db, 'Users', user.uid, 'Pumpkins', selectedPumpkin, 'Measurements', measurementId), {
        endToEnd,
        sideToSide,
        circumference,
        measurementUnit,
        estimatedWeight,
        timestamp: Timestamp.fromDate(measurementDate),
      });

      navigate(`/pumpkin/${selectedPumpkin}`);
    }
  };

  return (
    <div className="container mx-auto px-4 h-screen pt-10">
       <div className="bg-white shadow overflow-hidden rounded-lg p-4 w-full md:max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Add a Measurement</h2>
        <form onSubmit={addMeasurement} className="space-y-4">
          <select value={selectedPumpkin} onChange={(e) => setSelectedPumpkin(e.target.value)} className="mt-1 w-full p-2 border-2 border-gray-300 rounded">
            {pumpkins.map(pumpkin => (
              <option key={pumpkin.id} value={pumpkin.id}>{pumpkin.name}</option>
            ))}
          </select>
          <input type="number" placeholder="End to End" onChange={(e) => setEndToEnd(parseFloat(e.target.value))} required className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          <input type="number" placeholder="Side to Side" onChange={(e) => setSideToSide(parseFloat(e.target.value))} required className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          <input type="number" placeholder="Circumference" onChange={(e) => setCircumference(parseFloat(e.target.value))} required className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          <select value={measurementUnit} onChange={(e) => setMeasurementUnit(e.target.value)} className="mt-1 w-full p-2 border-2 border-gray-300 rounded">
            <option value="in">in</option>
            <option value="cm">cm</option>
          </select>
          <DatePicker selected={measurementDate} onChange={(date) => setMeasurementDate(date)} className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          <div className="flex justify-between items-center mt-4">
            <div>
              <span>OTT = </span><span>{calculateOTT()}</span>
            </div>
            <button type="button" onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline">Cancel</button>
            <button type="submit" className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Save Measurement</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMeasurement;
