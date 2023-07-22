import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import debounce from 'lodash.debounce';

// Function to convert a string to title case
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const getGrowerSuggestions = debounce(async (inputValue) => {
  try {
    const titleCaseInput = toTitleCase(inputValue);

    const growerRef = collection(db, 'Stats_Growers');
    const q = query(growerRef, where('lastName', '>=', titleCaseInput), where('lastName', '<=', titleCaseInput + '\uf8ff'));
    const querySnapshot = await getDocs(q);

    const growers = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      growers.push({ id: data.id });
    });

    return growers;
  } catch (error) {
    console.error('Error fetching grower suggestions:', error);
    return [];
  }
}, 300);

export default getGrowerSuggestions;
