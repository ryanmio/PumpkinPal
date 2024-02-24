'use client';
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase'; // Adjust the path as necessary
import { doc, onSnapshot } from 'firebase/firestore';
import Spinner from '../src/components/Spinner'; // Adjust the path as necessary

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [growerId, setGrowerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userAuth) => {
      if (userAuth) {
        onSnapshot(doc(db, 'Users', userAuth.uid), (docSnap) => {
          if (docSnap.exists()) {
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

    return () => unsubscribe();
  }, []);
    
  const contextValue = useMemo(() => ({ user, growerId, setGrowerId, loading }), [user, growerId, loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};