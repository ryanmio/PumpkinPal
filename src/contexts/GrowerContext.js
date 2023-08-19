import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';

export const GrowerContext = createContext();

export const GrowerContextProvider = ({ children }) => {
  const [growerName, setGrowerName] = useState(null);
  const [growerData, setGrowerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrowerData = async () => {
      setLoading(true);
      try {
        const growerCollection = collection(db, 'Stats_Growers');
        const growerDocRef = doc(growerCollection, growerName);
        const growerDoc = await getDoc(growerDocRef);
        if (!growerDoc.exists) {
          throw new Error(`No grower found with the name "${growerName}".`);
        }

        const pumpkinCollection = collection(db, 'Stats_Pumpkins');
        const pumpkinQuery = query(pumpkinCollection, where('grower', '==', growerName));
        const pumpkinDocs = await getDocs(pumpkinQuery);

        const growerData = { ...growerDoc.data(), pumpkins: pumpkinDocs.docs.map(doc => doc.data()) };
        setGrowerData(growerData);
        setLoading(false);
      } catch (error) {
        console.error(error); // Log the error to the console
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
