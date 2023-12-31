import React, { createContext, useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Spinner from '../components/Spinner';

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
            console.log('onSnapshot triggered, calling setUser...');
            setUser(userAuth);
            if(setGrowerId){
              console.log('calling setGrowerId...');
              setGrowerId(docSnap.data().growerId);
            }
            else{
              console.error('setGrowerId is not a function!');
            }
          } else {
            console.log('onSnapshot triggered, no docSnap exists, calling setUser...');
            setUser(userAuth);
            if(setGrowerId){
              console.log('calling setGrowerId with null...');
              setGrowerId(null);
            }
            else{
              console.error('setGrowerId is not a function!');
            }
          }
          setLoading(false);
        });
      } else {
        console.log('auth.onAuthStateChanged triggered, userAuth is null, calling setUser...');
        setUser(null);
        if(setGrowerId){
          console.log('calling setGrowerId with null...');
          setGrowerId(null);
        }
        else{
          console.error('setGrowerId is not a function!');
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
    
  const contextValue = useMemo(() => ({ user, growerId, setGrowerId, loading }), [user, growerId, loading]);

  useEffect(() => {
    console.log('UserContext useEffect, growerId changed:', growerId);
  }, [growerId]);

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