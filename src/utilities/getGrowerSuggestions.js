import { firestore } from './firebase'; // replace with your Firebase import
import debounce from 'lodash.debounce';

const getGrowerSuggestions = debounce(async (inputValue, callback) => {
  try {
    const growerRef = firestore.collection('Stats_Growers');
    const snapshot = await growerRef.where('lastName', '>=', inputValue).where('lastName', '<=', inputValue + '\uf8ff').get();
    
    const growers = [];
    snapshot.forEach(doc => {
      growers.push({ name: doc.id }); // assuming doc.id is the grower's name
    });

    callback(growers);
  } catch (error) {
    console.error('Error fetching grower suggestions:', error);
    callback([]);
  }
}, 300);

export default getGrowerSuggestions;
