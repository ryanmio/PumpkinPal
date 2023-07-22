import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore'; // import getDoc

console.log('db in fetchGrowerData.js:', db);

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
        resolve(docSnapshot.data()); // assuming docSnapshot.data() is the grower's data
      } else {
        console.log('No such document!');
        reject('No such document');
      }
    } catch (error) {
      console.error('Error fetching grower data:', error);
      reject(error);
    }
  });
};


export default fetchGrowerData;
