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

    const fetchGrowerId = async () => {
      if (!userId) {
        console.log("No userId, stopping loading");
        setLoading(false);
        setGrowerId(null);
        setGrowerData(null);
        setPumpkins([]);
        return;
      }

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
          setGrowerData(null);
          setPumpkins([]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in fetchGrowerId:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGrowerId();
  }, [userId]); // This effect only depends on userId, it will run whenever userId changes

  useEffect(() => {
    console.log("Running useEffect in useGrowerData with growerId:", growerId);

    if (!growerId) return; // If there's no growerId, there's nothing to do

    const fetchData = async () => {
      console.log('fetchData called with growerId:', growerId);
      try {
        const data = await fetchGrowerData(growerId);
        console.log('Received growerData:', data);
        setGrowerData(data);

        const pumpkinsData = await fetchPumpkins(growerId);
        console.log('Received pumpkinsData:', pumpkinsData);
        setPumpkins(pumpkinsData);

        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message);
        setLoading(false); // We also want to stop loading if there's an error
      }
    };

    fetchData();
  }, [growerId]); // This effect only depends on growerId, it will run whenever growerId changes

  return { growerId, growerData, pumpkins, loading, error };
};
