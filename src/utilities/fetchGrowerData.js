import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore'; // import getDoc

console.log('db in fetchGrowerData.js:', db);

const fetchGrowerData = async (growerId) => {
  try {
    const growerRef = doc(db, 'Stats_Growers', growerId);
    const docSnapshot = await getDoc(growerRef);
    
    if (docSnapshot.exists()) {
      return docSnapshot.data(); // assuming docSnapshot.data() is the grower's data
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching grower data:', error);
    return null;
  }
};

export default fetchGrowerData;
