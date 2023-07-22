import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import fetchPumpkins from './fetchPumpkins';
import fetchGrowerData from './fetchGrowerData';

export default function useGrowerData(userId) {
    console.log("Calling useGrowerData with userId:", userId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [growerId, setGrowerId] = useState(null);
  const [growerData, setGrowerData] = useState(null);
  const [pumpkins, setPumpkins] = useState([]);

  useEffect(() => {
      console.log("Running useEffect in useGrowerData with userId:", userId);
    const fetchData = async () => {
      console.log('fetchData called with userId:', userId);
      try {
        const docSnapshot = await getDoc(doc(db, 'Users', userId));
        console.log('Received docSnapshot:', docSnapshot.exists() ? docSnapshot.data() : 'no docSnapshot');
        if (docSnapshot.exists() && docSnapshot.data().growerId) {
          const id = docSnapshot.data().growerId;
          console.log('Found growerId:', id);
          setGrowerId(id);

          const data = await fetchGrowerData(id);
          console.log('Received growerData:', data);
          setGrowerData(data);

          const pumpkinsData = await fetchPumpkins(id);
          console.log('Received pumpkinsData:', pumpkinsData);
          setPumpkins(pumpkinsData);

          setLoading(false); // Move setLoading(false) here
        } else {
          // If the user hasn't set a growerId yet, we're not loading and there's no data.
          console.log("No growerId found for user:", userId);
          setLoading(false);
          setGrowerId(null);
          setGrowerData(null);
          setPumpkins([]);
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message);
        setLoading(false); // We also want to stop loading if there's an error
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]); // We only rerun the effect when userId changes

  return { growerId, growerData, pumpkins, loading, error };
};