import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'; // import necessary methods

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
        const growerDocRef = doc(db, 'Stats_Growers', growerName); // create a document reference
        const growerDoc = await getDoc(growerDocRef);
        if (!growerDoc.exists()) {
          throw new Error(`No grower found with the ID "${growerName}".`);
        }
        const pumpkinQuery = query(collection(db, 'Stats_Pumpkins'), where('id', '==', growerName));
        const pumpkinDocs = await getDocs(pumpkinQuery);
        const growerData = { ...growerDoc.data(), pumpkins: pumpkinDocs.docs.map(doc => doc.data()) };
        setGrowerData(growerData);
        setLoading(false);
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
    <GrowerContext.Provider value={{ growerName, setGrowerName, growerData, loading, error }}>
      {children}
    </GrowerContext.Provider>
  );
};
