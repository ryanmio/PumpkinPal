import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function PumpkinForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maternalLineage, setMaternalLineage] = useState('');
  const [paternalLineage, setPaternalLineage] = useState('');
  const [seedStarted, setSeedStarted] = useState(new Date());
  const [transplantOut, setTransplantOut] = useState(new Date());
  const [pollinated, setPollinated] = useState(new Date());
  const [weighOff, setWeighOff] = useState(new Date());
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const addPumpkin = async (e) => {
    e.preventDefault();
    if (name.trim() === '') {
      setError('Name field is required');
      return;
    }
    try {
      await addDoc(collection(db, 'Users', user.uid, 'Pumpkins'), {
        name,
        description,
        maternalLineage,
        paternalLineage,
        seedStarted,
        transplantOut,
        pollinated,
        weighOff
      });
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 h-screen pt-10">
      <div className="bg-white shadow overflow-hidden rounded-lg p-4 w-full md:max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Add a Pumpkin</h2>
        {error && <p className="text-red-600">{error}</p>}
        <form onSubmit={addPumpkin} className="space-y-4">
          <input type="text" placeholder="Bear Swipe" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          <textarea placeholder="150 patch" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full p-2 border-2 border-gray-300 rounded"></textarea>
          <input type="text" placeholder="1375 Connolly" value={maternalLineage} onChange={(e) => setMaternalLineage(e.target.value)} className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          <input type="text" placeholder="1676 New" value={paternalLineage} onChange={(e) => setPaternalLineage(e.target.value)} className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          <DatePicker selected={seedStarted} onChange={(date) => setSeedStarted(date)} className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          <DatePicker selected={transplantOut} onChange={(date) => setTransplantOut(date)} className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          <DatePicker selected={pollinated} onChange={(date) => setPollinated(date)} className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          <DatePicker selected={weighOff} onChange={(date) => setWeighOff(date)} className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline">Cancel</button>
            <button type="submit" className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Add Pumpkin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PumpkinForm;
