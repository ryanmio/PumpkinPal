import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import fetchPumpkins from './fetchPumpkins';
import fetchGrowerData from './fetchGrowerData';

export default function useGrowerData(userId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [growerId, setGrowerId] = useState(null);
  const [growerData, setGrowerData] = useState(null);
  const [pumpkins, setPumpkins] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnapshot = await getDoc(doc(db, 'Users', userId));
        if (docSnapshot.exists() && docSnapshot.data().growerId) {
          const id = docSnapshot.data().growerId;
          setGrowerId(id);

          const data = await fetchGrowerData(id);
          setGrowerData(data);

          const pumpkinsData = await fetchPumpkins(id);
          setPumpkins(pumpkinsData);
        } else {
          // If the user hasn't set a growerId yet, we're not loading and there's no data.
          setLoading(false);
          setGrowerId(null);
          setGrowerData(null);
          setPumpkins([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        // Only set loading to false if a growerId was set.
        if (growerId) {
          setLoading(false);
        }
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  return { growerId, growerData, pumpkins, loading, error };
};
