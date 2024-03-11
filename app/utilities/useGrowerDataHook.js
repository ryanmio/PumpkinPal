import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import fetchPumpkins from './fetchPumpkins';
import fetchGrowerData from './fetchGrowerData';

export default function useGrowerData(userId, growerIdFromContext) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [growerId, setGrowerId] = useState(null);
  const [growerData, setGrowerData] = useState(null);
  const [pumpkins, setPumpkins] = useState([]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

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

          setLoading(false); 
        } else {
          setLoading(false);
          setGrowerId(null);
          setGrowerData(null);
          setPumpkins([]);
        }
      } catch (err) {
        console.error('Error in fetchData:', err); // Keep this log to record potential errors
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, growerIdFromContext]);

  return { growerId, growerData, pumpkins, loading, error };
};
