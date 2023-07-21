import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase';

export const GrowerContext = createContext();

export const GrowerProvider = ({ children }) => {
  const [growerName, setGrowerName] = useState(null);
  const [growerData, setGrowerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrowerData = async () => {
      setLoading(true);
      try {
        console.log('Fetching grower data...');
        const growerDoc = await db.collection('Stats_Growers').doc(growerName).get();
        if (!growerDoc.exists) {
          throw new Error(`No grower found with the name "${growerName}".`);
        }
        const pumpkinDocs = await db.collection('Stats_Pumpkins').where('grower', '==', growerName).get();
        const growerData = { ...growerDoc.data(), pumpkins: pumpkinDocs.docs.map(doc => doc.data()) };
        setGrowerData(growerData);
        setLoading(false);
        console.log('Finished fetching grower data.');
      } catch (error) {
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
    <GrowerContext.Provider value={{ growerName, setGrowerName, growerData, loading, error }}>
      {children}
    </GrowerContext.Provider>
  );
};
