import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [growerId, setGrowerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userAuth) => {
      if (userAuth) {
        onSnapshot(doc(db, 'Users', userAuth.uid), (docSnap) => {
          if (docSnap.exists) {
            setUser(userAuth);
            setGrowerId(docSnap.data().growerId);
          } else {
            setUser(userAuth);
            setGrowerId(null);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setGrowerId(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <UserContext.Provider value={{user, growerId, loading}}>
      {children}
    </UserContext.Provider>
  );
};
