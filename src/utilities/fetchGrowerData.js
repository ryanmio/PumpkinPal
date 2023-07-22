import { db } from '../firebase';
const fetchGrowerData = async (growerId) => {
  try {
    const growerRef = firestore.collection('Stats_Growers').doc(growerId);
    const doc = await growerRef.get();
    
    if (doc.exists) {
      return doc.data();
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