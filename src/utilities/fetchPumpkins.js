import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const fetchPumpkins = async (growerId) => {
  try {
    const pumpkinsRef = collection(db, 'Stats_Pumpkins');
    const q = query(pumpkinsRef, where('grower', '==', growerId));
    const querySnapshot = await getDocs(q);

    const pumpkins = [];
    querySnapshot.forEach(doc => {
      pumpkins.push(doc.data());
    });

    return pumpkins;
  } catch (error) {
    console.error('Error fetching pumpkins:', error);
    return [];
  }
};

export default fetchPumpkins;
