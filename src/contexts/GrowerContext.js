import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase';

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
      // Query the document using growerName as the ID
      const growerDoc = await db.collection('Stats_Growers').doc(growerName).get();
      if (!growerDoc.exists) {
        throw new Error(`No grower found with the ID "${growerName}".`);
      }
      const pumpkinDocs = await db.collection('Stats_Pumpkins').where('id', '==', growerName).get(); // use 'id' in the where clause
      const growerData = { ...growerDoc.data(), pumpkins: pumpkinDocs.docs.map(doc => doc.data()) };
      setGrowerData(growerData);
      setLoading(false);
    } catch (error) {
      console.error("Error Detail:", error); // Log the entire error object
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
