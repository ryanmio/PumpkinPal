import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const fetchPumpkins = (growerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!growerId) {
        reject('No grower ID provided');
        return;
      }

      const pumpkinsRef = collection(db, 'Stats_Pumpkins');
      const q = query(pumpkinsRef, where('grower', '==', growerId));
      const querySnapshot = await getDocs(q);

      const pumpkins = [];
      querySnapshot.forEach(doc => {
        pumpkins.push(doc.data());
      });

      resolve(pumpkins);
    } catch (error) {
      toast.error('Error fetching pumpkins: ' + error.message);
      reject(error);
    }
  });
};

export default fetchPumpkins;
