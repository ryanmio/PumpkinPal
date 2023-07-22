import { db } from '../firebase';

console.log('db in fetchGrowerData.js:', db);

const fetchGrowerData = async (growerId) => {
  try {
    const growerRef = db.collection('Stats_Growers').doc(growerId);
    const doc = await growerRef.get();
    
    if (doc.exists) {
      return doc.data(); // assuming doc.data() is the grower's data
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
