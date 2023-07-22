import { firestore } from './firebase'; // replace with your Firebase import
import debounce from 'lodash.debounce';

// Function to convert a string to title case
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const getGrowerSuggestions = debounce(async (inputValue, callback) => {
  try {
    // Convert inputValue to title case
    const titleCaseInput = toTitleCase(inputValue);

    const growerRef = firestore.collection('Stats_Growers');
    const snapshot = await growerRef.where('lastName', '>=', titleCaseInput).where('lastName', '<=', titleCaseInput + '\uf8ff').get();
    
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
