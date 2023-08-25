import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore'; // Only import necessary methods
import fetchPumpkins from '../utilities/fetchPumpkins'; // import your fetchPumpkins function

export const GrowerContext = createContext();

export const GrowerContextProvider = ({ children }) => {
  const [growerName, setGrowerName] = useState(null);
  const [growerData, setGrowerData] = useState(null);
  const [pumpkins, setPumpkins] = useState(null); // Add state for pumpkins
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrowerData = async () => {
      setLoading(true);
      try {
        const growerDocRef = doc(db, 'Stats_Growers', growerName); // create a document reference
        const growerDoc = await getDoc(growerDocRef);
        if (!growerDoc.exists()) {
          throw new Error(`No grower found with the ID "${growerName}".`);
        }
        const growerData = growerDoc.data();
        setGrowerData(growerData);
        setLoading(false);

        // Fetch pumpkins using your existing fetchPumpkins function
        const fetchedPumpkins = await fetchPumpkins(growerName);
        setPumpkins(fetchedPumpkins); // Set pumpkins state
      } catch (error) {
        console.error("Error Detail:", error);
        setError(error.message);
        toast.error(error.message);
        setLoading(false);
      }
    };

    if (growerName) {
      fetchGrowerData();
    }
  }, [growerName]);

  return (
    <GrowerContext.Provider value={{ growerName, setGrowerName, growerData, pumpkins, loading, error }}>
      {children}
    </GrowerContext.Provider>
  );
};
