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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <UserContext.Provider value={{user, growerId, setGrowerId, loading}}>
      {children}
    </UserContext.Provider>
  );
};
