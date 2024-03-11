import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const fetchGrowerData = async (growerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!growerId) {
        reject('No grower ID provided');
        return;
      }

      const growerRef = doc(db, 'Stats_Growers', growerId);
      const docSnapshot = await getDoc(growerRef);
      
      if (docSnapshot.exists()) {
        resolve(docSnapshot.data());
      } else {
        toast.error('No such document!');
        reject('No such document');
      }
    } catch (error) {
      toast.error('Error fetching grower data: ' + error.message);
      reject(error);
    }
  });
};

export default fetchGrowerData;
