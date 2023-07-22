import React, { useState, useEffect } from 'react';
import getGrowerSuggestions from '../../utilities/getGrowerSuggestions';
import fetchPumpkins from '../../utilities/fetchPumpkins';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// Function to convert a string to title case
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const GrowerSearch = ({ user, setGrowerId }) => {
  const [growerName, setGrowerName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedGrower, setSelectedGrower] = useState(null);
  const [pumpkinPreview, setPumpkinPreview] = useState([]);

  useEffect(() => {
    if (growerName) {
      getGrowerSuggestions(toTitleCase(growerName), setSuggestions);
    }
  }, [growerName]);

  useEffect(() => {
  console.log('selectedGrower changed:', selectedGrower); // log statement
  if (selectedGrower) {
    fetchPumpkins(selectedGrower.id).then(setPumpkinPreview);
  }
}, [selectedGrower]);

  const handleSelectGrower = (grower) => {
    setSelectedGrower(grower);
  };

  const handleConfirm = () => {
    updateDoc(doc(db, 'Users', user.uid), {
      growerId: selectedGrower.id
    }).then(() => {
      setGrowerId(selectedGrower.id); // call setGrowerId
    }).catch(error => {
      console.error('Error updating document:', error);
    });
  };
    
  return (
    <div>
      <h1>Search for a Grower</h1>
      <input
        type="text"
        value={growerName}
        onChange={(e) => setGrowerName(e.target.value)}
        placeholder="Enter grower name"
      />
      {suggestions.map(suggestion => (
        <div key={suggestion.id} onClick={() => handleSelectGrower(suggestion)}>
          {suggestion.id} {/* display the id in the suggestion list */}
        </div>
      ))}
      {selectedGrower && (
        <div>
          <h2>Selected Grower: {selectedGrower.id}</h2>
          <h3>Pumpkin Preview:</h3>
          {pumpkinPreview.map(pumpkin => (
          <div key={pumpkin.id}>
            ID: {pumpkin.id}, Year: {pumpkin.year}
          </div>
        ))}
          <button onClick={handleConfirm}>Confirm</button>
        </div>
      )}
    </div>
  );
};

export default GrowerSearch;
