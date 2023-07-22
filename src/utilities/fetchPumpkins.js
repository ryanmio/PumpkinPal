import { firestore } from '../firebase';

const fetchPumpkins = async (growerId) => {
  try {
    const pumpkinsRef = firestore.collection('Stats_Pumpkins');
    const snapshot = await pumpkinsRef.where('growerId', '==', growerId).get();
    
    const pumpkins = [];
    snapshot.forEach(doc => {
      pumpkins.push(doc.data()); // assuming doc.data() is the pumpkin's data
    });

    return pumpkins;
  } catch (error) {
    console.error('Error fetching pumpkins:', error);
    return [];
  }
};

export default fetchPumpkins;