import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore'; // import collection, query, where, getDocs

const fetchPumpkins = async (growerId) => {
  try {
    const pumpkinsRef = collection(db, 'Stats_Pumpkins');
    const q = query(pumpkinsRef, where('growerId', '==', growerId));
    const querySnapshot = await getDocs(q);
    
    const pumpkins = [];
    querySnapshot.forEach(doc => {
      pumpkins.push(doc.data()); // assuming doc.data() is the pumpkin's data
    });

    return pumpkins;
  } catch (error) {
    console.error('Error fetching pumpkins:', error);
    return [];
  }
};

export default fetchPumpkins;
