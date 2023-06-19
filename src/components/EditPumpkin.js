import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function EditPumpkin() {
  const { id } = useParams();
  const [pumpkin, setPumpkin] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Add the auth state observer
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchPumpkin = async () => {
          const pumpkinDoc = await getDoc(doc(db, 'Users', user.uid, 'Pumpkins', id));
          setPumpkin({ ...pumpkinDoc.data(), id: pumpkinDoc.id });
        };
        fetchPumpkin();
      }
    });

    // Unsubscribe from the observer when the component is unmounted
    return () => unsubscribe();
  }, [id]);

  const handleChange = (e) => {
    setPumpkin({ ...pumpkin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (auth.currentUser) {
      await updateDoc(doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', id), pumpkin);
    }
    navigate(`/dashboard`);
  };

  if (!pumpkin) return 'Loading...';

  return (
    <div className="container mx-auto px-4 h-screen pt-10">
      <div className="bg-white shadow overflow-hidden rounded-lg p-6 w-full md:max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Edit a Pumpkin</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-left">Name:</label>
          <input name="name" value={pumpkin.name} onChange={handleChange} required className="w-full p-2 border-2 border-gray-300 rounded" />
          
          <label className="block text-left">Description:</label>
          <textarea name="description" value={pumpkin.description} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          
          <label className="block text-left">Maternal Lineage:</label>
          <input name="maternalLineage" value={pumpkin.maternalLineage} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />

          <label className="block text-left">Paternal Lineage:</label>
          <input name="paternalLineage" value={pumpkin.paternalLineage} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          
          <div className="grid grid-cols-2 gap-1">
            <label className="text-left">Seed Started:</label>
            <input type="date" name="seedStarted" value={pumpkin.seedStarted} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            <label className="text-left">Transplant Out:</label>
            <input type="date" name="transplantOut" value={pumpkin.transplantOut} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            <label className="text-left">Pollinated:</label>
            <input type="date" name="pollinated" value={pumpkin.pollinated} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            <label className="text-left">Weigh-Off:</label>
            <input type="date" name="weighOff" value={pumpkin.weighOff} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>

          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => navigate(location.state.from || '/dashboard')} className="text-blue-600 hover:underline">Go Back</button>
            <button type="submit" className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPumpkin;
