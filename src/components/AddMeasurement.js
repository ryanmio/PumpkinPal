import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db, Timestamp, onAuthStateChanged } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import "react-datepicker/dist/react-datepicker.css";
import MeasurementInput from './MeasurementInput';
import DateInput from './DateInput';
import { Toaster } from 'react-hot-toast';

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

  useEffect(() => {
    const fetchLastMeasurement = async () => {
      if(selectedPumpkin) {
        const user = auth.currentUser;
        if(user) {
          const q = query(collection(db, 'Users', user.uid, 'Pumpkins', selectedPumpkin, 'Measurements'), orderBy('timestamp', 'desc'), limit(1));
          const snapshot = await getDocs(q);
          if(!snapshot.empty) {
            const measurement = snapshot.docs[0].data();
            setEndToEnd(parseFloat(measurement.endToEnd));
            setSideToSide(parseFloat(measurement.sideToSide));
            setCircumference(parseFloat(measurement.circumference));
            setMeasurementDate(new Date());
          } else {
            setEndToEnd('');
            setSideToSide('');
            setCircumference('');
            setMeasurementDate(new Date());
          }
        }
      }
    };

    fetchLastMeasurement();
  }, [selectedPumpkin]);

  const calculateEstimatedWeight = (endToEnd, sideToSide, circumference, measurementUnit) => {
    let ott = parseFloat(endToEnd) + parseFloat(sideToSide) + parseFloat(circumference);
    if (measurementUnit === 'cm') {
      ott /= 2.54;  // Convert cm to inches
    }
    let weight = (((14.2 / (1 + 7.3 * Math.pow(2, -(ott) / 96))) ** 3 + (ott / 51) ** 2.91) - 8) * 0.993;

    // If weight is less than 0, set it to 0
    if (weight < 0) {
      weight = 0;
    }

    return weight.toFixed(2);  // round to 2 decimal places
};


  const calculateOTT = () => {
    if(endToEnd && sideToSide && circumference) {
      return parseFloat(endToEnd) + parseFloat(sideToSide) + parseFloat(circumference);
    }
    return 0;
  };

  const addMeasurement = async (e) => {
  e.preventDefault();
  const estimatedWeight = calculateEstimatedWeight(endToEnd, sideToSide, circumference, measurementUnit);
  const measurementId = Date.now().toString();
  const user = auth.currentUser;
  if(user && selectedPumpkin) {
    try {
      await setDoc(doc(db, 'Users', user.uid, 'Pumpkins', selectedPumpkin, 'Measurements', measurementId), {
        endToEnd,
        sideToSide,
        circumference,
        measurementUnit,
        estimatedWeight,
        timestamp: Timestamp.fromDate(measurementDate),
      });
      navigate(`/pumpkin/${selectedPumpkin}`);
    } catch (error) {
      toast.error("Failed to add measurement. Please ensure the date is valid and try again.");
    }
  }
};


  return (
    <div className="container mx-auto px-4 h-screen pt-10">
      <Toaster />
      <div className="bg-white shadow overflow-hidden rounded-lg p-4 w-full md:max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2 text-center">Add a Measurement</h2>
        <form onSubmit={addMeasurement} className="space-y-4">
          <div className="flex justify-between items-center">
            <select value={selectedPumpkin} onChange={(e) => setSelectedPumpkin(e.target.value)} className="mt-1 p-2 border-2 border-gray-300 rounded text-center flex-grow mr-2">
              {pumpkins.map(pumpkin => (
                <option key={pumpkin.id} value={pumpkin.id}>{pumpkin.name}</option>
              ))}
            </select>
            <select value={measurementUnit} onChange={(e) => setMeasurementUnit(e.target.value)} className="mt-1 w-auto p-2 border-2 border-gray-300 rounded text-center">
              <option value="in">in</option>
              <option value="cm">cm</option>
            </select>
          </div>
          <MeasurementInput 
            id="endToEnd"
            placeholder="End to End"
            onChange={(e) => setEndToEnd(parseFloat(e.target.value))}
            min={0} 
            max={999}
            value={endToEnd} 
          />
          <MeasurementInput 
            id="sideToSide"
            placeholder="Side to Side"
            onChange={(e) => setSideToSide(parseFloat(e.target.value))}
            min={0} 
            max={999}
            value={sideToSide} 
          />
          <MeasurementInput 
            id="circumference"
            placeholder="Circumference"
            onChange={(e) => setCircumference(parseFloat(e.target.value))}
            min={0} 
            max={999}
            value={circumference} 
          />
          <DateInput 
            id="measurementDate"
            selected={measurementDate}
            onChange={(date) => setMeasurementDate(date)} 
          />
          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline">Cancel</button>
            <button 
              type="submit" 
              className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${endToEnd && sideToSide && circumference ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500' : 'button-disabled'}`}
              disabled={!(endToEnd && sideToSide && circumference)}
            >
              Save Measurement (OTT: {calculateOTT()})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMeasurement;