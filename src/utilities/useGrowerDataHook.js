import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import fetchPumpkins from '../../utilities/fetchPumpkins';
import fetchGrowerData from '../../utilities/fetchGrowerData';

export const useGrowerData = (userId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [growerId, setGrowerId] = useState(null);
  const [growerData, setGrowerData] = useState(null);
  const [pumpkins, setPumpkins] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnapshot = await getDoc(doc(db, 'Users', userId));
        if (docSnapshot.exists()) {
          const id = docSnapshot.data().growerId;
          setGrowerId(id);

          const data = await fetchGrowerData(id);
          setGrowerData(data);

          const pumpkinsData = await fetchPumpkins(id);
          setPumpkins(pumpkinsData);
        } else {
          setError('No such document!');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  return { growerId, growerData, pumpkins, loading, error };
};
