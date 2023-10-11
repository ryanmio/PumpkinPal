import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { trackError, trackUserEvent } from '../utilities/error-analytics'

function PumpkinForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maternalLineage, setMaternalLineage] = useState('');
  const [paternalLineage, setPaternalLineage] = useState('');
    const [seedStarted, setSeedStarted] = useState('');
    const [transplantOut, setTransplantOut] = useState('');
    const [pollinated, setPollinated] = useState('');
    const [weighOff, setWeighOff] = useState('');
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
      // Extract year from the earliest date available
      const dates = [seedStarted, transplantOut, pollinated, weighOff].filter(Boolean);
      const earliestDate = dates.sort()[0];
      const season = earliestDate ? new Date(earliestDate).getFullYear() : new Date().getFullYear();
  
      await addDoc(collection(db, 'Users', user.uid, 'Pumpkins'), {
        name,
        description,
        maternalLineage,
        paternalLineage,
        seedStarted,
        transplantOut,
        pollinated,
        weighOff,
        season // Add season field
      });
      trackUserEvent('Added Pumpkin', 'PumpkinForm.addPumpkin');
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
      trackError(error, 'PumpkinForm.addPumpkin');
    }
  };

 return (
    <div className="container mx-auto px-4 h-screen pt-10">
      <div className="bg-white shadow overflow-hidden rounded-lg p-6 w-full md:max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Add a Pumpkin</h2>
        {error && <p className="text-red-600">{error}</p>}
        <form onSubmit={addPumpkin} className="space-y-4">
          <div className="field space-y-1">
            <label className="block text-left">Name:</label>
            <input type="text" placeholder="Bear Swipe" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          
          <div className="field space-y-1">
            <label className="block text-left">Description:</label>
            <textarea placeholder="150 patch" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border-2 border-gray-300 rounded"></textarea>
          </div>
          
          <div className="field space-y-1">
            <label className="block text-left">Seed:</label>
            <input type="text" placeholder="1375 Connolly" value={maternalLineage} onChange={(e) => setMaternalLineage(e.target.value)} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>

          <div className="field space-y-1">
            <label className="block text-left">Cross:</label>
            <input type="text" placeholder="1676 New" value={paternalLineage} onChange={(e) => setPaternalLineage(e.target.value)} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-1 field space-y-1">
          <label className="text-left">Seed Started:</label>
          <input type="date" value={seedStarted} onChange={(e) => setSeedStarted(e.target.value)} className="w-full p-2 border-2 border-gray-300 rounded" />
        </div>

        <div className="grid grid-cols-2 gap-1 field space-y-1">
          <label className="text-left">Transplant Out:</label>
          <input type="date" value={transplantOut} onChange={(e) => setTransplantOut(e.target.value)} className="w-full p-2 border-2 border-gray-300 rounded" />
        </div>

        <div className="grid grid-cols-2 gap-1 field space-y-1">
          <label className="text-left">Pollinated:</label>
          <input type="date" value={pollinated} onChange={(e) => setPollinated(e.target.value)} className="w-full p-2 border-2 border-gray-300 rounded" />
        </div>

        <div className="grid grid-cols-2 gap-1 field space-y-1">
          <label className="text-left">Weigh-Off:</label>
          <input type="date" value={weighOff} onChange={(e) => setWeighOff(e.target.value)} className="w-full p-2 border-2 border-gray-300 rounded" />
        </div>

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
