'use client'
// app/edit-pumpkin/[id]/page.js
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth, db } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { trackError, trackUserEvent, GA_CATEGORIES, GA_ACTIONS } from '../../../app/utilities/error-analytics';
import { toast } from 'react-hot-toast';

function EditPumpkin() {
  const router = useRouter();
  const { id } = useParams();
  const [pumpkin, setPumpkin] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchPumpkin = async () => {
          try {
            const pumpkinDoc = await getDoc(doc(db, 'Users', user.uid, 'Pumpkins', id));
            setPumpkin({ ...pumpkinDoc.data(), id: pumpkinDoc.id });
          } catch (error) {
            toast.error("Failed to load pumpkin. Please try again.");
            console.error("Error loading pumpkin: ", error);
            trackError(error, 'EditPumpkin - Failed Fetch', GA_CATEGORIES.USER, GA_ACTIONS.ERROR);
          }
        };
        fetchPumpkin();
      }
    });
    
    return () => unsubscribe();
  }, [id]);

  const handleChange = (e) => {
    setPumpkin({ ...pumpkin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (auth.currentUser) {
      try {
        // Validate dates
        const seedStartedDate = new Date(pumpkin.seedStarted);
        const transplantOutDate = new Date(pumpkin.transplantOut);
        const pollinatedDate = pumpkin.pollinated ? new Date(pumpkin.pollinated) : null;
        const weighOffDate = pumpkin.weighOff ? new Date(pumpkin.weighOff) : null;

        if (transplantOutDate < seedStartedDate) {
          toast.error("Transplant out date cannot be earlier than seed started date.");
          return; // Stop the form submission
        }

        if (pollinatedDate && transplantOutDate > pollinatedDate) {
          toast.error("Pollinated date cannot be earlier than transplant out date.");
          return; // Stop the form submission
        }

        if (weighOffDate && pollinatedDate && weighOffDate < pollinatedDate) {
          toast.error("Weigh off date cannot be earlier than pollinated date.");
          return; // Stop the form submission
        }

        // Extract year from the earliest date available
        const dates = [pumpkin.seedStarted, pumpkin.transplantOut, pumpkin.pollinated, pumpkin.weighOff].filter(Boolean);
        const earliestDate = dates.sort()[0];
        const season = earliestDate ? new Date(earliestDate).getFullYear() : new Date().getFullYear();
  
        await updateDoc(doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', id), {
          ...pumpkin,
          season // Update season field
        });
        toast.success('Pumpkin updated successfully!');
        trackUserEvent(GA_ACTIONS.EDIT_PUMPKIN, 'EditPumpkin - Successful');
        router.push(`/dashboard`);
      } catch (error) {
        toast.error("Failed to update pumpkin. Please try again.");
        console.error("Error updating pumpkin: ", error);
        trackError(error, 'EditPumpkin - Failed', GA_CATEGORIES.USER, GA_ACTIONS.ERROR);
      }
    }
  };

  if (!pumpkin) return 'Loading...';

 return (
    <div className="container mx-auto px-4 h-screen pt-10">
      <div className="bg-white shadow overflow-hidden rounded-lg p-6 w-full md:max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Edit a Pumpkin</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="field space-y-1">
            <label className="block text-left">Name:</label>
            <input name="name" value={pumpkin.name} onChange={handleChange} required className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          
          <div className="field space-y-1">
            <label className="block text-left">Description:</label>
            <textarea name="description" value={pumpkin.description} onChange={handleChange} maxLength="90" className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          
          <div className="field space-y-1">
            <label className="block text-left">Seed:</label>
            <input name="maternalLineage" value={pumpkin.maternalLineage} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>

          <div className="field space-y-1">
            <label className="block text-left">Cross:</label>
            <input name="paternalLineage" value={pumpkin.paternalLineage} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-1 field space-y-1">
            <label className="text-left">Seed Started:</label>
            <input type="date" name="seedStarted" value={pumpkin.seedStarted} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-1 field space-y-1">
            <label className="text-left">Transplant Out:</label>
            <input type="date" name="transplantOut" value={pumpkin.transplantOut} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-1 field space-y-1">
            <label className="text-left">Pollinated:</label>
            <input type="date" name="pollinated" value={pumpkin.pollinated} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-1 field space-y-1">
            <label className="text-left">Weigh-Off:</label>
            <input type="date" name="weighOff" value={pumpkin.weighOff} onChange={handleChange} className="w-full p-2 border-2 border-gray-300 rounded" />
          </div>

          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">Go Back</button>
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
