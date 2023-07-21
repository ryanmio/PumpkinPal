import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

export const GrowerContext = createContext();

export const GrowerContextProvider = ({ children }) => {
  const [growerName, setGrowerName] = useState(null);
  const [growerData, setGrowerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Grower name in GrowerContextProvider:', growerName); // Log the growerName

        const fetchGrowerData = async () => {
      setLoading(true);
      console.log('Fetching data for grower:', growerName); // Log the growerName
      try {
        console.log('db instance:', db);
        const growerDoc = await db.collection('Stats_Growers').doc(growerName).get();
        console.log('Grower data from Firestore:', growerDoc.data()); // Log the growerDoc

        // Throw an error if no grower data is found
        if (!growerDoc.exists) {
          throw new Error(`No grower found with the name "${growerName}".`);
        }

        const pumpkinDocs = await db.collection('Stats_Pumpkins').where('grower', '==', growerName).get();
        console.log('Pumpkin data from Firestore:', pumpkinDocs.docs.map(doc => doc.data())); // Log the pumpkinDocs

        const growerData = { ...growerDoc.data(), pumpkins: pumpkinDocs.docs.map(doc => doc.data()) };
        setGrowerData(growerData);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching grower data:', error.message); // Log the error message
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
