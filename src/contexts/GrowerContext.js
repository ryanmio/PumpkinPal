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
        const growerDocRef = doc(db, 'Stats_Growers', growerName);
        const growerDoc = await getDoc(growerDocRef);
        console.log('Grower data from Firestore:', growerDoc.data()); // Log the growerDoc
        if (!growerDoc.exists) {
          throw new Error(`No grower found with the name "${growerName}".`);
        }
        const pumpkinQuery = query(collection(db, 'Stats_Pumpkins'), where('grower', '==', growerName));
        const pumpkinDocs = await getDocs(pumpkinQuery);
        console.log('Pumpkin data from Firestore:', pumpkinDocs.docs.map(doc => doc.data())); // Log the pumpkinDocs
        const growerData = { ...growerDoc.data(), pumpkins: pumpkinDocs.docs.map(doc => doc.data()) };
        setGrowerData(growerData);
        setLoading(false);
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
