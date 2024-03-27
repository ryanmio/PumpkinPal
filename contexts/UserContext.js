'use client';
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Spinner from '../components/ui/Spinner';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [growerId, setGrowerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        setUser(userAuth);
        const userDoc = await getDoc(doc(db, 'Users', userAuth.uid));
        if (userDoc.exists()) {
          setGrowerId(userDoc.data().growerId);
        }
      } else {
        setUser(null);
        setGrowerId(null);
      }
      setLoading(false);
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