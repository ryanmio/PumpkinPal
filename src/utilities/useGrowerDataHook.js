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
    console.log("Running useEffect in useGrowerData with userId:", userId, "and growerId:", growerId);

    // If we don't have a userId or a growerId, we're not loading and there's no data.
    if (!userId || !growerId) {
      console.log("No userId or growerId, stopping loading");
      setLoading(false);
      setGrowerData(null);
      setPumpkins([]);
      return;
    }

    const fetchData = async () => {
      console.log('fetchData called with userId:', userId, 'and growerId:', growerId);
      try {
        const data = await fetchGrowerData(growerId);
        console.log('Received growerData:', data);
        setGrowerData(data);

        const pumpkinsData = await fetchPumpkins(growerId);
        console.log('Received pumpkinsData:', pumpkinsData);
        setPumpkins(pumpkinsData);

        setLoading(false); // Move setLoading(false) here
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message);
        setLoading(false); // We also want to stop loading if there's an error
      }
    };

    fetchData();
  }, [userId, growerId]); // We rerun the effect when either userId or growerId changes

  // We separate out the effect that fetches the growerId from Firestore
  // This effect only depends on userId, so it will only run again when userId changes
  useEffect(() => {
    console.log("Running growerId fetching useEffect with userId:", userId);
    const fetchGrowerId = async () => {
      if (!userId) return;
      try {
        const docSnapshot = await getDoc(doc(db, 'Users', userId));
        console.log('Received docSnapshot:', docSnapshot.exists() ? docSnapshot.data() : 'no docSnapshot');
        if (docSnapshot.exists() && docSnapshot.data().growerId) {
          const id = docSnapshot.data().growerId;
          console.log('Found growerId:', id);
          setGrowerId(id);
        } else {
          console.log("No growerId found for user:", userId);
          setGrowerId(null);
        }
      } catch (err) {
        console.error('Error in fetchGrowerId:', err);
        setError(err.message);
      }
    };
    fetchGrowerId();
  }, [userId]);

  return { growerId, growerData, pumpkins, loading, error };
};
